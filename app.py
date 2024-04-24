from flask import Flask, render_template, redirect, request, url_for, flash, session,jsonify,send_file,abort
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
import pymongo
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import json
from bson import ObjectId
app = Flask(__name__, static_url_path='/static', static_folder='static')
# Access environment variables
load_dotenv()
MONGODB_URI = os.getenv('MONGODB_URI')
SESSION_TIMEOUT = int(os.getenv('SESSION_TIMEOUT'))
app.config['SESSION_TIMEOUT'] = 300
app.config['UPLOAD_FOLDER'] = 'static/asset'
app.config['MODEL_FOLDER']='static/models'
client = MongoClient('mongodb://localhost:27017/')
db = client.mydatabase  # Replace 'mydatabase' with your database name
users_collection = db.users  # Replace 'users' with your collection name
locations_collection = db.locations
models_collection=db.models
samples_collection=db.samples
models_metadata=db.metadata
app.secret_key = '1e41e302bce37f312109b9c5d22411108bb6d1c850377e9434e97eacb3097043'
login_manager = LoginManager(app)

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])  # Convert ObjectId to string
        self.username = user_data['username']
        self.password_hash = user_data['password_hash']
        self.email = user_data.get('email', '')  # Handle missing email field
        self.role = user_data['role']
        self.cover_photo = user_data.get('cover_photo', '')

    def get_id(self):
        return self.id

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

@app.route('/')
def index():
    return render_template('base.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/users')
def users():
    # Query the MongoDB database to retrieve user data
    user_data = users_collection.find({})
    return render_template('users.html', users=user_data)


@app.route('/location')
def location():
    # Fetch location data from the database
    locations = locations_collection.find({})

    # Pass the location data to the location.html template
    return render_template('location.html', locations=locations)

@app.route('/get_photo')
def get_photo():
    # Define the file path of the photo
    file_path = 'static/asset/'

    try:
        # Send the photo file as a response
        return send_file(file_path, mimetype='image/jpeg')
    except FileNotFoundError:
        # Handle file not found error
        return 'Photo not found', 404
@app.route('/samples')
def samples():
    samples=samples_collection.find({})
    return render_template('samples.html', samples=samples)

@app.route('/report')
def report():
    return render_template('report.html')

@login_manager.user_loader
def load_user(user_id):
    # Load user from MongoDB
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    if user_data:
        user = User(user_data['username'], user_data['password_hash'], user_data['email'], user_data['role'], user_data.get('cover_photo', None))
        user.id = str(user_data['_id'])  # Convert ObjectId to string
        return user
    return None


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user_data = users_collection.find_one({'username': username})
        if user_data and check_password_hash(user_data['password_hash'], password):
            session['user_id'] = str(user_data['_id'])  # Convert ObjectId to string
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully!', 'success')
    return redirect(url_for('login'))

@app.route('/new_user')
def new_user():
    return render_template('new_user.html')
@app.route('/model')
def model():
    # Retrieve locations from the database
    locations = locations_collection.find({})
    model_data=models_collection.find({})
    # Format locations data as a list of dictionaries
    locations_data = [{'_id': str(location['_id']), 'name': location.get('factory_location', 'Unknown')} for location in locations]
    
    # Convert locations data to JSON string
    locations_json = json.dumps(locations_data)
    
    return render_template('model.html', locations_json=locations_json, models=model_data)
@app.route('/submit_form', methods=['POST'])
def submit_form():
    # Retrieve form data
    object_name = request.form.get('objectName')
    location = request.form.get('locationType')  # Assuming 'locationType' is the correct name from the HTML
    sample_type = request.form.get('sampleType')
    presence_frequency = request.form.get('presenceFrequency')
    incident = request.form.get('incident')
    
    # Handle file upload (evidence)
    if 'evidence' in request.files:
        evidence_file = request.files['evidence']
        # Save the uploaded file
        if evidence_file.filename != '':
            evidence_filename = secure_filename(evidence_file.filename)
            evidence_file.save(os.path.join(app.config['UPLOAD_FOLDER'], evidence_filename))
        else:
            evidence_filename = None
    else:
        evidence_filename = None
    
    # Store the form data in the MongoDB collection
    model_data = {
        'object_name': object_name,
        'location': location,
        'sample_type': sample_type,
        'presence_frequency': presence_frequency,
        'incident': incident,
        'evidence_filename': evidence_filename
    }
    models_metadata.insert_one(model_data)
    print('object name',object_name)
    # Return a response indicating success
    return jsonify({'message': 'Form submitted successfully'})

@app.route('/add_model', methods=['POST'])
def add_model():
    # Retrieve form data
    model_name = request.form.get('modelName')
    description = request.form.get('description')
    location = request.form.get('location')
    model_file = request.files.get('modelFile')
    image_file = request.files.get('modelImage')
    if model_file and image_file:
        # Save files to storage
        model_filename = secure_filename(model_file.filename)
        image_filename = secure_filename(image_file.filename)
        model_file.save(os.path.join(app.config['MODEL_FOLDER'], model_filename))
        image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))

        # Store data in MongoDB
        model_data = {
            'model_name': model_name,
            'description': description,
            'location': location,
            'model_filename': model_filename,
            'image_filename': image_filename
        }
        models_collection.insert_one(model_data)

    # Redirect to a relevant page after processing
    return redirect(url_for('model'))
@app.route('/view_model/<model_id>')
def view_model(model_id):
    # Query the database to get model details by ID
    samples = samples_collection.find({})
    model = models_collection.find_one({'_id': ObjectId(model_id)})
    
    if model:
        model_filename = model.get('model_filename')
        if model_filename:
            return render_template('view_model.html', model=model, samples=samples, model_filename=model_filename)
        else:
            # Handle case where model filename is not found
            return render_template('404.html'), 404
    else:
        # Handle case where model is not found
        return render_template('404.html'), 404
@app.route('/tag_model/<model_id>')
def tag_model(model_id):
    # Query the database to get model details by ID
    samples = samples_collection.find({})
    model = models_collection.find_one({'_id': ObjectId(model_id)})
    locations=locations_collection.find({})
    if model:
        model_filename = model.get('model_filename')
        if model_filename:
            return render_template('tag_model.html', model=model, samples=samples, model_filename=model_filename,locations=locations)
        else:
            # Handle case where model filename is not found
            return render_template('404.html'), 404
    else:
        # Handle case where model is not found
        return render_template('404.html'), 404
@app.before_request
def update_last_activity():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(seconds=app.config['SESSION_TIMEOUT'])
    session['last_activity'] = datetime.now()

@app.route('/activity', methods=['POST'])
def activity():
    # Update last activity time
    session['last_activity'] = datetime.now()
    return '', 204  # No content
@app.route('/delete_user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    # Delete the user from the database
    result = users_collection.delete_one({'_id': ObjectId(user_id)})
    if result.deleted_count == 1:
        return 'User deleted successfully', 200
    else:
        return 'User not found', 404
@app.before_request
@app.before_request
def check_session_timeout():
    if 'last_activity' in session:
        # Calculate time elapsed since last activity
        time_elapsed = datetime.now() - session['last_activity']
        if time_elapsed.total_seconds() > app.config['SESSION_TIMEOUT']:
            # Redirect to login page if session expired
            return redirect(url_for('login'))


    session['last_activity'] = datetime.now()

@app.route('/add_user', methods=['POST'])
def add_user():
    if request.method == 'POST':
        # Retrieve form data
        fullname = request.form.get('fullname')
        username = request.form.get('username')
        email = request.form.get('email')
        user_role = request.form.get('user_role')
        password = request.form.get('password')
        
        # Handle file upload for cover photo
        cover_photo = request.files['photo']
        if cover_photo:
            filename = secure_filename(cover_photo.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            cover_photo.save(file_path)
        else:
            file_path = None

        # Check if username is the same as email
        if username == email:
            flash('Username cannot be the same as email.', 'error')
            return render_template('new_user.html')

        # Hash the password
        password_hash = generate_password_hash(password)

        # Create a new user object
        new_user = {
            'fullname': fullname,
            'username': username,
            'email': email,
            'user_role': user_role,
            'password_hash': password_hash,
            'cover_photo': file_path
        }

# Insert the new user into MongoDB
    result = users_collection.insert_one(new_user)

    if result.inserted_id:
    # User successfully inserted
        flash('User added successfully!', 'success')
        print('successful entry')
        return redirect(url_for('users', new_user_added=True))
    else:
    # Failed to insert user
        flash('Failed to add user.', 'error')
        return render_template('new_user.html')


def create_static_user():
    # Check if the user 'manager' already exists
    existing_user = users_collection.find_one({'username': 'manager'})
    if existing_user:
        print("User 'manager' already exists.")
        return

    # Hash the password for the new user
    password_hash = generate_password_hash('manager')

    # Create the new user object
    new_user = {
        'username': 'manager',
        'password_hash': password_hash,
        'role': 'admin'
    }

    # Insert the new user into MongoDB
    users_collection.insert_one(new_user)

    print("User 'manager' created successfully.")
@app.route('/edit_profile/<user_id>', methods=['GET', 'POST'])
def edit_profile(user_id):
    # Query MongoDB to retrieve user data based on user_id
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    print(f"Edit profile requested for user ID: {user_id}") 
    if user_data:
        return render_template('edit_profile.html', user=user_data)
    else:
        # Handle case where user is not found
        return render_template('404.html'), 404
@app.route('/add_location', methods=['POST'])
def add_location():
    if request.method == 'POST':
        # Retrieve form data
        factory_name = request.form.get('factoryName')
        factory_location = request.form.get('factoryLocation')
        
        # Handle file upload for photo
        photo_upload = request.files['photoUpload']
        if photo_upload:
            filename = secure_filename(photo_upload.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            photo_upload.save(file_path)
        else:
            file_path = None

        # Store location details in MongoDB
        try:
            locations_collection.insert_one({
                'factory_name': factory_name,
                'factory_location': factory_location,
                'photo_filename': filename
            })
            # print('factory name:',factory_name)
            # print('factory location:',factory_location)
            # print('photo path:',file_path)
            # Return success response
            return jsonify({'message': 'Location added successfully'}), 200
        except Exception as e:
            # Return error response
            return jsonify({'error': str(e)}), 500
        
@app.route('/add_sample', methods=['POST'])
def add_sample():
    if request.method == 'POST':
        # Retrieve form data
        sample_name = request.form.get('sampleName')
        sample_description = request.form.get('sampleDescription')
        
        # Handle file upload for photo
        photo_upload = request.files['photoUpload']
        if photo_upload:
            filename = secure_filename(photo_upload.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            photo_upload.save(file_path)
        else:
            file_path = None

        # Store location details in MongoDB
        try:
            samples_collection.insert_one({
                'sample_name': sample_name,
                'sample_description': sample_description,
                'photo_filename': filename
            })
            # print('factory name:',factory_name)
            # print('factory location:',factory_location)
            # print('photo path:',file_path)
            # Return success response
            return jsonify({'message': 'Location added successfully'}), 200
        except Exception as e:
            # Return error response
            return jsonify({'error': str(e)}), 500
@app.route('/edit_sample/<sample_id>', methods=['GET'])
def edit_sample(sample_id):
    # Query MongoDB to retrieve location data based on location ID
    sample_data = samples_collection.find_one({'_id': ObjectId(sample_id)})
    
    # Check if location data exists
    if sample_data:
        # Render template for editing location data and pass location data to template
        return render_template('edit_sample.html', sample=sample_data)
    else:
        # Handle case where location is not found
        return render_template('404.html'), 404
@app.route('/edit_location/<location_id>', methods=['GET'])
def edit_location(location_id):
    # Query MongoDB to retrieve location data based on location ID
    location_data = locations_collection.find_one({'_id': ObjectId(location_id)})
    
    # Check if location data exists
    if location_data:
        # Render template for editing location data and pass location data to template
        return render_template('edit_location.html', location=location_data)
    else:
        # Handle case where location is not found
        return render_template('404.html'), 404

@app.route('/update_sample/<sample_id>', methods=['POST'])
def update_sample(sample_id):
    # Retrieve updated location details from the form data
    sample_name = request.form.get('sampleName')
    sample_description = request.form.get('sampleDescription')
    photo_upload = request.files.get('photoUpload')

    # Update the location document in the database
    sample = samples_collection.find_one({'_id': ObjectId(sample_id)})
    if sample:
        # Update factory name and location
        samples_collection.update_one({'_id': ObjectId(sample_id)}, {'$set': {'sample_name': sample_name, 'sample_description': sample_description}})

        # Handle photo upload if a new photo is provided
        if photo_upload:
            filename = secure_filename(photo_upload.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            photo_upload.save(file_path)
            samples_collection.update_one({'_id': ObjectId(sample_id)}, {'$set': {'photo_filename': filename}})

        # Redirect the user to the location details page or another appropriate page
        return redirect(url_for('samples', sample_id=sample_id))
    else:
        # Handle case where location is not found
        return render_template('404.html'), 404
@app.route('/delete_sample/<sample_id>', methods=['DELETE'])
def delete_sample(sample_id):
    try:
        # Delete the location from the database
        result = samples_collection.delete_one({'_id': ObjectId(sample_id)})
        
        # Check if the deletion was successful
        if result.deleted_count == 1:
            # Redirect to the location page or another appropriate page
            return redirect(url_for('samples'))
        else:
            # If the location was not found, return a 404 error
            return render_template('404.html'), 404
    except Exception as e:
        # Handle any exceptions that occur during the deletion process
        print(f"Failed to delete sample with ID {sample_id}. Error: {str(e)}")
        abort(500)
@app.route('/update_location/<location_id>', methods=['POST'])
def update_location(location_id):
    # Retrieve updated location details from the form data
    factory_name = request.form.get('factoryName')
    factory_location = request.form.get('factoryLocation')
    photo_upload = request.files.get('photoUpload')

    # Update the location document in the database
    location = locations_collection.find_one({'_id': ObjectId(location_id)})
    if location:
        # Update factory name and location
        locations_collection.update_one({'_id': ObjectId(location_id)}, {'$set': {'factory_name': factory_name, 'factory_location': factory_location}})

        # Handle photo upload if a new photo is provided
        if photo_upload:
            filename = secure_filename(photo_upload.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            photo_upload.save(file_path)
            locations_collection.update_one({'_id': ObjectId(location_id)}, {'$set': {'photo_filename': filename}})

        # Redirect the user to the location details page or another appropriate page
        return redirect(url_for('location', location_id=location_id))
    else:
        # Handle case where location is not found
        return render_template('404.html'), 404
@app.route('/delete_location/<location_id>', methods=['DELETE'])
def delete_location(location_id):
    try:
        # Delete the location from the database
        result = locations_collection.delete_one({'_id': ObjectId(location_id)})
        
        # Check if the deletion was successful
        if result.deleted_count == 1:
            # Redirect to the location page or another appropriate page
            return redirect(url_for('location'))
        else:
            # If the location was not found, return a 404 error
            return render_template('404.html'), 404
    except Exception as e:
        # Handle any exceptions that occur during the deletion process
        print(f"Failed to delete location with ID {location_id}. Error: {str(e)}")
        abort(500)
if __name__ == '__main__':
    create_static_user()
    app.run(debug=True,host='0.0.0.0',port='5000')
