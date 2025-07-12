# LIBSI AI - Legal Assistant

This project provides a web based legal assistant focused on South African law.  
It also includes the original Streamlit demo used as a starting point.
**LIBSI AI does not replace professional legal counsel. Use it at your own risk.**

[![Open in Streamlit](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://chatbot-template.streamlit.app/)

### How to run it on your own machine

1. Install the requirements

   ```
   $ pip install -r requirements.txt
   ```

2. Index your legal documents (optional)

   Place text files in the `docs/` folder and run:

   ```
   $ OPENAI_API_KEY=... python index_documents.py
   ```

3. Run the app

   ```
   $ streamlit run streamlit_app.py
   ```

### Running the LIBSI AI web app

1. Install Node.js dependencies

   ```bash
   npm install
   ```

2. Create a `.env` file containing your OpenAI key

   ```
   OPENAI_API_KEY=your_openai_key_here
   ```

3. Start the Express backend

   ```bash
   node server.js
   ```

4. Open `http://localhost:3000` in your browser. You can also open
   `public/index.html` directly, but the backend must still be running on
   `http://localhost:3000` for chat requests to succeed.
   The interface supports voice input, text-to-speech replies, exporting the chat
   to PDF, selecting legal forms, and choosing a role (Guest, Paralegal, Advocate).
