from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)

# Read your API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json(force=True)
        prompt = data.get("prompt", "")

        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        # Call OpenAI API
        completion = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are the Oracle. Answer based on provided lore and artifacts if relevant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        answer = completion.choices[0].message["content"]

        # Your AskTheOracle expects { response, citations }
        return jsonify({
            "response": answer,
            "citations": []
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
