from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/ask', methods=['POST'])
def ask():
    prompt = request.json.get('prompt', '')
    return jsonify({ "response": f"You asked: {prompt}" })

if __name__ == '__main__':
    app.run(port=5000)