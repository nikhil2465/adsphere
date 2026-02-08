# BlindOCR Web - Deployment Guide for PythonAnywhere

This guide will walk you through deploying the BlindOCR web application to PythonAnywhere's free tier.

## Prerequisites

1. A PythonAnywhere account (free tier is sufficient)
2. Git installed on your local machine
3. Your application code pushed to a Git repository (GitHub, GitLab, etc.)

## Step 1: Set up PythonAnywhere

1. Log in to your [PythonAnywhere](https://www.pythonanywhere.com/) account
2. Go to the "Web" tab and click on "Add a new web app"
3. Choose "Flask" as the web framework
4. Select the latest Python version (3.9 or later recommended)
5. Use the default project path: `/home/your_username/BlindOCR_Web`

## Step 2: Install System Dependencies

PythonAnywhere's free tier requires some additional setup for system dependencies:

1. Open a new Bash console in PythonAnywhere
2. Run the following commands:
   ```bash
   # Install Tesseract OCR
   sudo apt-get update
   sudo apt-get install tesseract-ocr
   
   # Install Poppler for PDF processing
   sudo apt-get install poppler-utils
   
   # Install additional language packs if needed (example for Spanish)
   # sudo apt-get install tesseract-ocr-spa
   ```

## Step 3: Deploy Your Application

### Option A: Using Git (Recommended)

1. In the PythonAnywhere console:
   ```bash
   # Navigate to your home directory
   cd ~
   
   # Clone your repository
   git clone https://github.com/yourusername/BlindOCR_Web.git
   cd BlindOCR_Web
   ```

### Option B: Using PythonAnywhere's Files Interface

1. Go to the "Files" tab in PythonAnywhere
2. Upload all files from your local `BlindOCR_Web` directory

## Step 4: Set Up Virtual Environment

1. In the PythonAnywhere console:
   ```bash
   # Create a virtual environment
   mkvirtualenv --python=/usr/bin/python3.9 venv
   
   # Activate the virtual environment
   workon venv
   
   # Install requirements
   pip install -r requirements.txt
   ```

## Step 5: Configure Web App

1. Go to the "Web" tab in PythonAnywhere
2. Click on your web app
3. In the "Code" section:
   - Set the source code directory to: `/home/your_username/BlindOCR_Web`
   - Set the working directory to: `/home/your_username/BlindOCR_Web`
   - Set the virtualenv to: `/home/your_username/.virtualenvs/venv`

4. In the "WSGI configuration file" section, update the file to:
   ```python
   import os
   import sys
   
   path = '/home/your_username/BlindOCR_Web'
   if path not in sys.path:
       sys.path.append(path)
   
   from app import app as application
   ```
   (Replace `your_username` with your actual PythonAnywhere username)

## Step 6: Configure Static Files

1. In the "Static files" section:
   - Add a mapping for `/static/` to `/home/your_username/BlindOCR_Web/static/`
   - Add a mapping for `/audio/` to `/home/your_username/BlindOCR_Web/audio/`

2. Create the audio directory if it doesn't exist:
   ```bash
   mkdir -p ~/BlindOCR_Web/audio
   ```

## Step 7: Set Up Scheduled Tasks (Optional)

To clean up old audio files automatically:

1. Go to the "Tasks" tab
2. Add a new scheduled task that runs daily:
   ```bash
   find /home/your_username/BlindOCR_Web/audio -type f -mtime +1 -delete
   ```

## Step 8: Start Your Web App

1. Go to the "Web" tab
2. Click the green "Reload" button to restart your web app
3. Your app should now be live at: `yourusername.pythonanywhere.com`

## Troubleshooting

### Common Issues

1. **Poppler not found**
   - Make sure you've installed poppler-utils
   - Add this to your `app.py` before any imports:
     ```python
     os.environ['PATH'] += ':/usr/bin/'
     ```

2. **Tesseract not found**
   - Verify Tesseract is installed: `which tesseract`
   - Update the path in `app.py` if needed:
     ```python
     pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'
     ```

3. **Import errors**
   - Make sure your virtual environment is activated
   - Try reinstalling requirements: `pip install -r requirements.txt`

## Maintenance

- **Updating Your App**:
  1. Push changes to your Git repository
  2. In PythonAnywhere console:
     ```bash
     cd ~/BlindOCR_Web
     git pull
     ```
  3. Reload your web app

- **Viewing Logs**:
  - Check the error logs in the "Web" tab under "Log files"
  - View server logs in the "Logs" tab

## Security Notes

1. The free tier of PythonAnywhere has some limitations:
   - Your app will go to sleep after a period of inactivity
   - You have limited disk space (500MB total)
   - Outbound internet access is restricted

2. For production use, consider:
   - Upgrading to a paid plan
   - Setting up proper HTTPS
   - Implementing user authentication
   - Adding rate limiting

## Support

If you encounter any issues, please check the PythonAnywhere [help pages](https://help.pythonanywhere.com/) or contact their support.
