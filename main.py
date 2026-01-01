import streamlit as st
import google.generativeai as genai
import os
import json

# =====================
# CONFIG
# =====================
st.set_page_config(
    page_title="Smart Travel Planner AI",
    page_icon="✈️",
    layout="centered"
)

st.title("✈️ Smart Travel Planner AI")
st.caption("Powered by Gemini AI")

# =====================
# API KEY
# =====================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    st.error("GEMINI_API_KEY belum diset")
    st.stop()

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# =====================
# FORM INPUT
# =====================
with st.form("trip_form"):
    destination = st.text_input("Tujuan Wisata", placeholder="Tokyo, Jepang")
    days = st.number_input("Jumlah Hari", min_value=1, max_value=30, value=3)
    budget = st.selectbox(
        "Budget",
        ["Low", "Medium", "High"]
    )
    style = st.multiselect(
        "Gaya Traveling",
        ["Kuliner", "Budaya", "Alam", "Shopping", "Santai"]
    )

    submit = st.form_submit_button("Buat Rencana Perjalanan")

# =====================
# GENERATE ITINERARY
# =====================
if submit:
    if not destination:
        st.warning("Tujuan wajib diisi")
        st.stop()

    prompt = f"""
    Buatkan itinerary perjalanan dengan format JSON.

    Tujuan: {destination}
    Durasi: {days} hari
    Budget: {budget}
    Preferensi: {', '.join(style)}

    Format JSON:
    {{
      "days": [
        {{
          "day": 1,
          "places": [
            {{
              "name": "Nama Tempat",
              "description": "Deskripsi singkat",
              "category": "Kategori"
            }}
          ]
        }}
      ]
    }}
    """

    with st.spinner("Menyusun itinerary..."):
        response = model.generate_content(prompt)

    try:
        data = json.loads(response.text)

        st.success("Itinerary berhasil dibuat 🎉")

        for day in data["days"]:
            st.subheader(f"Hari {day['day']}")
            for place in day["places"]:
                with st.container():
                    st.markdown(f"**📍 {place['name']}**")
                    st.caption(place["category"])
                    st.write(place["description"])
                    st.divider()

    except Exception:
        st.error("Gagal parsing response AI")
        st.code(response.text)
