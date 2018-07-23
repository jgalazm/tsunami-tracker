brew install python
pip3 install virtualenv
python3 -m pip install --user virtualenv
python3 -m virtualenv py3env
source py3env/bin/activate
cp tracker-osx/* .
npm install
pip3 install -r requirements.txt
