import qrcode

base_url = "https://tayyebsoubra.github.io/question.html?id="

for i in range(1, 13):  # 12 questions
    url = base_url + str(i)
    img = qrcode.make(url)
    img.save(f"question_{i}.png")
