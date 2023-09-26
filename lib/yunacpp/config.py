import os
import shutil
import zipfile

# Specify the path to the build-yuna.zip file
zip_file_path = 'build-yuna.zip'

# Check if yuna.so already exists in the parent directory
if not os.path.exists('yuna.so'):
    # Unzip the build-yuna.zip file
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall('build-yuna')

    # Change the current working directory to 'build-yuna'
    os.chdir('build-yuna')

    # Check if a Makefile exists in the directory
    if os.path.exists('Makefile'):
        # Run the 'make' command
        os.system('make')
        
        # Change back to the parent directory
        os.chdir('..')
    else:
        print('Makefile not found in the "build-yuna" directory. Please check the directory contents.')

else:
    print('yuna.so already exists. No action needed.')
