# -*- coding: utf-8 -*-
"""
Created on Thu Aug 13 01:25:36 2020

@author: Sugandhan
"""


import math
from sklearn import neighbors
import os
import os.path
import pickle
from PIL import Image, ImageDraw
import face_recognition
from face_recognition.face_recognition_cli import image_files_in_folder
import numpy as np
from flask import Flask, request, jsonify, make_response
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
from flask_cors import CORS, cross_origin
from flask_ngrok import run_with_ngrok
from pyunpack import Archive
from distutils.dir_util import copy_tree
import os
from PIL import Image
from io import BytesIO
import base64
import json
import re
import socket
import time

from starlette.applications import Starlette
from starlette.responses import JSONResponse
import uvicorn
import ssl
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest





def train(train_dir, model_save_path=None, n_neighbors=None, knn_algo='ball_tree', verbose=False):
    """
    Trains a k-nearest neighbors classifier for face recognition.

    :param train_dir: directory that contains a sub-directory for each known person, with its name.

    
    """
    X = []
    y = []

    # Loop through each person in the training set
    for class_dir in os.listdir(train_dir):
        if not os.path.isdir(os.path.join(train_dir, class_dir)):
            continue

        # Loop through each training image for the current person
        for img_path in image_files_in_folder(os.path.join(train_dir, class_dir)):
            image = face_recognition.load_image_file(img_path)
            face_bounding_boxes = face_recognition.face_locations(image)

            if len(face_bounding_boxes) != 1:
                # If there are no people (or too many people) in a training image, skip the image.
                if verbose:
                    print("Image {} not suitable for training: {}".format(img_path, "Didn't find a face" if len(face_bounding_boxes) < 1 else "Found more than one face"))
            else:
                # Add face encoding for current image to the training set
                X.append(face_recognition.face_encodings(image, known_face_locations=face_bounding_boxes)[0])
                y.append(class_dir)

    # Determine how many neighbors to use for weighting in the KNN classifier
    if n_neighbors is None:
        n_neighbors = int(round(math.sqrt(len(X))))
        if verbose:
            print("Chose n_neighbors automatically:", n_neighbors)

    # Create and train the KNN classifier
    knn_clf = neighbors.KNeighborsClassifier(n_neighbors=n_neighbors, algorithm=knn_algo, weights='distance')
    knn_clf.fit(X, y)

    # Save the trained KNN classifier
    if model_save_path is not None:
        with open(model_save_path, 'wb') as f:
            pickle.dump(knn_clf, f)

    return knn_clf


def predict(X_img, knn_clf=None, model_path=None, distance_threshold=0.5):
    """
    Recognizes faces in given image using a trained KNN classifier

    :param X_img_path: path to image to be recognized
    :param knn_clf: (optional) a knn classifier object. if not specified, model_save_path must be specified.
    :param model_path: (optional) path to a pickled knn classifier. if not specified, model_save_path must be knn_clf.
    :param distance_threshold: (optional) distance threshold for face classification. the larger it is, the more chance
           of mis-classifying an unknown person as a known one.
    :return: a list of names and face locations for the recognized faces in the image: [(name, bounding box), ...].
        For faces of unrecognized persons, the name 'unknown' will be returned.
    """
    
    # Load a trained KNN model (if one was passed in)
    if knn_clf is None:
        with open(model_path, 'rb') as f:
            knn_clf = pickle.load(f)
            
    # Load image file and find face locations
    X_face_locations = face_recognition.face_locations(X_img)

    # If no faces are found in the image, return an empty result.
    if len(X_face_locations) == 0:
        return []

    # Find encodings for faces in the test iamge
    faces_encodings = face_recognition.face_encodings(X_img, known_face_locations=X_face_locations)

    # Use the KNN model to find the best matches for the test face
    closest_distances = knn_clf.kneighbors(faces_encodings, n_neighbors=1)
    are_matches = [closest_distances[0][i][0] <= distance_threshold for i in range(len(X_face_locations))]

    # Predict classes and remove classifications that aren't within the threshold
    return [(pred, loc) if rec else ("unknown", loc) for pred, loc, rec in zip(knn_clf.predict(faces_encodings), X_face_locations, are_matches)]


def show_prediction_labels_on_image(img_path, predictions):
    """
    Shows the face recognition results visually.

    :param img_path: path to image to be recognized
    :param predictions: results of the predict function
    :return:
    """
    pil_image = Image.open(img_path).convert("RGB")
    draw = ImageDraw.Draw(pil_image)

    for name, (top, right, bottom, left) in predictions:
        # Draw a box around the face using the Pillow module
        draw.rectangle(((left, top), (right, bottom)), outline=(0, 0, 255))

        # There's a bug in Pillow where it blows up with non-UTF-8 text
        # when using the default bitmap font
        name = name.encode("UTF-8")

        # Draw a label with a name below the face
        text_width, text_height = draw.textsize(name)
        draw.rectangle(((left, bottom - text_height - 10), (right, bottom)), fill=(0, 0, 255), outline=(0, 0, 255))
        draw.text((left + 6, bottom - text_height - 5), name, fill=(255, 255, 255, 255))
    del draw

   


####################Spacy Test Summarisation########################################

def summarize(text, per):
    nlp = spacy.load('en_core_web_sm')
    doc= nlp(text)
    tokens=[token.text for token in doc]
    word_frequencies={}
    for word in doc:
        if word.text.lower() not in list(STOP_WORDS):
            if word.text.lower() not in punctuation:
                if word.text not in word_frequencies.keys():
                    word_frequencies[word.text] = 1
                else:
                    word_frequencies[word.text] += 1
    max_frequency=max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word]=word_frequencies[word]/max_frequency
    sentence_tokens= [sent for sent in doc.sents]
    sentence_scores = {}
    for sent in sentence_tokens:
        for word in sent:
            if word.text.lower() in word_frequencies.keys():
                if sent not in sentence_scores.keys():                            
                    sentence_scores[sent]=word_frequencies[word.text.lower()]
                else:
                    sentence_scores[sent]+=word_frequencies[word.text.lower()]
    select_length=int(len(sentence_tokens)*per)
    summary=nlargest(select_length, sentence_scores,key=sentence_scores.get)
    final_summary=[word.text for word in summary]
    summary=''.join(final_summary)
    return summary

## Run flask app with Ngrok
app = Flask(__name__)
CORS(app)
run_with_ngrok(app)


@app.route("/find_person", methods=["POST"])
def find_person():
    print("OKK")
    #file = request.files['file']
    file = request.files['image']
    # Read the image via file.stream
    X_img = Image.open(file.stream)
    # X_img.show()
    X_img = X_img.convert("RGB")
    X_img=np.array(X_img)
    predictions = predict(X_img, model_path="trained_knn_model.clf")
    print(predictions[0][0])
    ##return jsonify({'msg': 'success', 'Person_Identified_as': "OK"})
#    response1=jsonify({'msg': 'success','Name': predictions[0][0] })
#    response1.headers.set('Access-Control-Allow-Origin', '*')
#    return response1

    response1 = make_response(
            jsonify({'msg': 'success','Name': predictions[0][0] }),201)
    response1.headers["Access-Control-Allow-Origin"] = "*"
    return response1

@app.route("/train_data", methods=["GET"])
def train_data():
    print("Training KNN classifier...")
    classifier = train("knn_examples/train", model_save_path="trained_knn_model.clf", n_neighbors=2)
    print("Training complete!")
    response2=jsonify({'msg': 'Trainning Successful'})
    response2.headers.set('Access-Control-Allow-Origin','*')
    return response2


@app.route("/add_person", methods=["POST"])
def add_person():
    file = request.files['file']
    # Read the image via file.stream
    file_name=file.filename
    file.save(file_name)
    # Parent Directory path
    Input_FolderName=os.path.splitext(file_name)[0]
    Archive(file_name).extractall('.')
    #parent_dir = "C:\Users\Sugandhan\Desktop" 
    Main_path = os.getcwd()
    Training_Folder = os.path.join(Main_path,"knn_examples\\train")
    Training_Folder = os.path.join(Training_Folder,Input_FolderName )
    os.mkdir(Training_Folder) 
    Input_folder1=os.path.join(Main_path,Input_FolderName )   
    #Target_folder1=os.path.join(Target_folder,"Sundhar Pichai" ) 
    copy_tree(Input_folder1,Training_Folder)
    response3 = make_response(
            jsonify({'msg': 'success' }),201)
    response3.headers["Access-Control-Allow-Origin"] = "*"
    return response3


@app.route('/hook', methods=['POST'])
def get_image():
    image_b64 = request.values['imageBase64']
    image_data = re.sub('^data:image/.+;base64,', '', image_b64).decode('base64')
    image_PIL = Image.open(cStringIO.StringIO(image_b64))
    image_np = np.array(image_PIL)
    print("Image received:")
    return ''

@app.route('/upload', methods=['POST'])
def upload():
    millis = int(time.time() * 1000)
    fn = f'{image_dir}/{millis}.jpg'
    data = request.get_data()
    with open(fn, 'wb') as f:
        f.write(data)
    return jsonify({'filename': fn})


@app.route('/take_pic',methods=["POST"])
def disp_pic():
    data = request.data
    encoded_data = data.split(',')
    nparr = np.fromstring(encoded_data.decode('base64'), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    cv2.imshow(img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    
@app.route('/summarisetext',methods=["GET"])    
def summarise():
    content = request.get_json()
    print( content["text"])
    result = summarize(content["text"], 0.7 )
    response3 = make_response(
            jsonify({'msg': result }),201)
    response3.headers["Access-Control-Allow-Origin"] = "*"
    return response3

if __name__ == "__main__":
    app.run()
    #app.run(port=443,ssl_context=(r"C:\Users\Administrator\Desktop\Python\example.com+11.pem", r"C:\Users\Administrator\Desktop\Python\example.com+11-key.pem"))

