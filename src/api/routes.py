"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Puzzle, PuzzleGroup, PuzzleItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import date

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/api/puzzle/today', methods=['GET'])
def get_todays_puzzle():
    todays_date = date.today()

    # .first() returns the puzzle or None. it doesn't raise an exception
    # if nothing is found, which lets us handle the 404 case cleanly below.

    puzzle = Puzzle.query.filter_by(publish_date = todays_date).first()
    
    # If no puzzle exists for today, this will return a clear error on the frontend
    # can catch and display a "no puzzle today" message instead of crashing.

    if puzzle is None:
        return jsonify({
            "error": "Unfortunately, there is no puzzle today.",
            "date": todays_date.isoformat()
        }), 404
    
    return jsonify(puzzle.serialize()), 200

# API for fetching any puzzle by its ID. Used during development to test seeded puzzles without having to match with today's date. 
# Example: GET /api/puzzle/1

@api.route('/api/puzzle/<int:puzzle_id>', methods=['GET'])
def get_puzzle_by_id(puzzle_id):
    puzzle = db.session.get(Puzzle, puzzle_id)

    if puzzle is None:
        return jsonify({
            "error": f"No puzzle found with id {puzzle_id}."
        }), 404

    return jsonify(puzzle.serialize()), 200