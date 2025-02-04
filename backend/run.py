from app import create_app

# Create the app instance using the create_app function
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)  # Running on localhost:5000
