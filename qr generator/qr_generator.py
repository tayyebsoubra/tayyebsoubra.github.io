import qrcode

base_url = "https://tayyebsoubra.github.io/question.html?q="
uuid = "74679d42-6cef-43a1-9af8-a7e716dcd38f"
url = base_url + uuid
img = qrcode.make(url)
img.save(f"question_1.png")
