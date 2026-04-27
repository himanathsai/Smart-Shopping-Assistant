import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Initialize Gemini if API key is present
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/generate-recipes', methods=['POST'])
def generate_recipes():
    data = request.json
    ingredients = data.get('ingredients', [])
    
    if not ingredients:
        return jsonify({"error": "No ingredients provided"}), 400

    prompt = f"""
    Generate 3 simple, beginner-friendly recipes using these ingredients as the core components: {', '.join(ingredients)}.
    You can assume basic pantry staples (salt, pepper, oil, water) are available.
    
    Format the response EXACTLY as a JSON array of objects. Do not use markdown blocks like ```json. Just raw JSON.
    Each object must have exactly these keys:
    "title": (string) The name of the recipe
    "ingredients": (array of strings) The ingredients used
    "steps": (array of strings) 3-4 short, simple cooking steps
    "icon": (string) A single emoji representing the dish
    """

    if API_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            # Clean up the response in case it has markdown code blocks
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.endswith('```'):
                text = text[:-3]
            
            recipes = json.loads(text)
            return jsonify({"recipes": recipes})
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fallback to mock on error
            return jsonify({"recipes": get_mock_recipes(ingredients)})
    else:
        # Fallback to mock data if no API key is provided
        return jsonify({"recipes": get_mock_recipes(ingredients)})

def get_mock_recipes(ingredients):
    return [
        {
            "title": f"Quick {ingredients[0].title()} Stir-fry",
            "ingredients": ingredients + ["Soy Sauce", "Oil", "Garlic"],
            "steps": [
                f"Heat oil in a pan and sauté garlic.",
                f"Add {', '.join(ingredients)} and cook until tender.",
                "Stir in soy sauce and serve hot."
            ],
            "icon": "🥘"
        },
        {
            "title": f"Simple {ingredients[0].title()} Bowl",
            "ingredients": ingredients + ["Rice or Quinoa", "Salt", "Pepper"],
            "steps": [
                f"Prepare rice or quinoa according to package instructions.",
                f"Sauté or roast {', '.join(ingredients)}.",
                "Combine in a bowl, season with salt and pepper, and enjoy."
            ],
            "icon": "🍲"
        }
    ]

if __name__ == '__main__':
    print("Starting ExpiryGuard AI server on port 5000...")
    app.run(debug=True, port=5000)
