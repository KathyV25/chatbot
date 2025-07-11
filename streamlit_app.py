import os
import pickle
import streamlit as st
import numpy as np
import faiss
from openai import OpenAI

# Show title and description.
st.title("💬 Chatbot")
st.write(
    "This app demonstrates a simple legal assistant powered by OpenAI."
    " It does not provide official legal advice and should be used for informational purposes only."
)

# Persona configuration
default_persona = (
    "You are a senior legal counsel specializing in South African law. "
    "Provide clear, thorough answers with references when available. "
    "Always include the disclaimer that you are an AI system and not a substitute for professional legal advice."
)
persona_text = st.text_area("Persona", value=default_persona)

# Ask user for their OpenAI API key via `st.text_input`.
# Alternatively, you can store the API key in `./.streamlit/secrets.toml` and access it
# via `st.secrets`, see https://docs.streamlit.io/develop/concepts/connections/secrets-management
openai_api_key = st.text_input("OpenAI API Key", type="password")
if not openai_api_key:
    st.info("Please add your OpenAI API key to continue.", icon="🗝️")
else:

    # Create an OpenAI client.
    client = OpenAI(api_key=openai_api_key)

    # Load retrieval index if available
    index = None
    documents = []
    if os.path.exists("legal_index.faiss") and os.path.exists("legal_docs.pkl"):
        index = faiss.read_index("legal_index.faiss")
        with open("legal_docs.pkl", "rb") as f:
            documents = pickle.load(f)

    # Create a session state variable to store the chat messages. This ensures that the
    # messages persist across reruns.
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {"role": "system", "content": persona_text}
        ]

    # Display the existing chat messages via `st.chat_message`.
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Create a chat input field to allow the user to enter a message. This will display
    # automatically at the bottom of the page.
    if prompt := st.chat_input("What is up?"):

        # Store and display the current prompt.
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # Retrieve relevant legal documents
        if index is not None:
            emb = client.embeddings.create(model="text-embedding-ada-002", input=prompt)
            query_vec = np.array(emb.data[0].embedding, dtype="float32").reshape(1, -1)
            dists, idxs = index.search(query_vec, 3)
            context = []
            for i in idxs[0]:
                if i != -1:
                    context.append(documents[i]["text"])
            if context:
                st.session_state.messages.append({
                    "role": "system",
                    "content": "Relevant legal context:\n" + "\n\n".join(context)
                })

        # Generate a response using the OpenAI API.
        stream = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": m["role"], "content": m["content"]}
                for m in st.session_state.messages
            ],
            stream=True,
        )

        # Stream the response to the chat using `st.write_stream`, then store it in 
        # session state.
        with st.chat_message("assistant"):
            response = st.write_stream(stream)
        st.session_state.messages.append({"role": "assistant", "content": response})
