# Linux dependencies:
libsdl-dev libsdl-image1.2-dev libsdl-mixer1.2-dev libsdl-ttf2.0-dev libsmpeg-dev libportmidi-dev libavformat-dev libswscale-dev python3-dev python3-numpy

# OSX dependencies:
- /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
- brew install python
- pip3 install virtualenv
- python3 -m pip install --user virtualenv
- python3 -m virtualenv py3env
- source py3env/bin/activate
- sudo DYLD_LIBRARY_PATH=. ./psmove pair
- Disconnect cable
- Press psmove button
- ???
- 