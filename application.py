import os
import time

from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from flask_session import Session

# set up Flask and SocketIO
app = Flask(__name__)
app.config["SECRET_KEY"] = "my_secret"
socketio = SocketIO(app, async_mode = None)


channels = []
my_messages = {}
users = {}



@socketio.on("username")
def receive_username(username):
	# pairing usernames with session IDs
	users[username] = request.sid

# Send message module
@socketio.on("room_message")
def messageHandler(json):
	my_time = time.ctime(time.time())
	my_data ={"user": json["user"], "msg" : json["msg"], "my_time": my_time}
	my_messages[json["channel"]].append(my_data)
	if len(my_messages[json["channel"]]) > 100:
		my_messages[json["channel"]].pop(0)
	print("Message passed on!")
	emit("room_message", my_data, room = json["channel"])

# Create channel module
@socketio.on("channel_creation")
def channel_creation(channel):
	# if channel name is taken
	if channel in channels:
		emit("channel_error", "This name is already taken!")
	# if channel is not taken
	else:
		# add channel to the list of channels
		channels.append(channel)
		my_messages[channel] = []
		# add user to the channel
		join_room(channel)
		current_channel = channel
		data = {"channel": channel, "messages": my_messages[channel]}
		emit("join_channel", data)

# The join channel module
@socketio.on("join_channel")
def join_channel(channel):
	# adding user to the channel
	join_room(channel)
	data = {"channel": channel, "messages": my_messages[channel]}
	emit("join_channel", data)

# The leave channel moduule
@socketio.on("leave_channel")
def leave_channel(channel):
	# removing the user from the channel
	leave_room(channel)
	emit("leave_channel", channel)

# The change channel module
@socketio.on("change_channel")
def change_channel(old_channel, new_channel):
	leave_room(old_channel)
	join_room(new_channel)
	data = {"channel": new_channel, "messages": my_messages[new_channel]}
	emit("join_channel", data)


# File upload module
@socketio.on('file upload')
def file_upload(data):
    """ when user uploads a file """
    # emiting received file and user data back to the users current room
    emit('file received', data, room=data['room'])


@app.route("/")
def index():
	# return the chat page
	return render_template("index.html", channels = channels, users = users, async_mode = socketio.async_mode)

if __name__ == "__main__":
	socketio.run(app, debug = True)