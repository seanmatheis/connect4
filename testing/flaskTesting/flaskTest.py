from flask import Flask, redirect, url_for, render_template
#http://127.0.0.1:5000/startGame

app = Flask(__name__)

@app.route("/startGame")
def startGame():
    return render_template("startGame.html")

@app.route("/gameplay")
def gameplay():
    return render_template("gameplay.html")



if __name__ == "__main__":
    app.run()