from pathlib import Path
import json
import csv
import os

reactPath = 'src/i18n/locales/'

# if we're running from the script directory, run from the base repo directory instead
if os.path.exists(os.path.basename(__file__)):
	os.chdir("../..")

# get a list of all .csv files in the current directory
csvs  = [f.name for f in Path('.').iterdir() if f.name.endswith('.csv')]

# user input menu, to select which .csv file to process
while True:
    chosenCsv = input('Choose a csv to import ' + str(csvs) + ': ')
    if chosenCsv in ['exit', 'quit']:
        quit()
    if chosenCsv in csvs:
        break
    
chosenLang = {}

# process the .csv into a dictionary of dictionaries for the chosen language
# e.g. {'common.json': {'accept': 'Acepto'}, 'daoCreate.json': {'buttonCreate': 'Crear un Fractal'}}
with open(chosenCsv, 'r') as f:
    reader = csv.reader(f)
    next(reader, None) # skip headers
    for row in reader:
        if not row[3]:
            continue
        if row[0] not in chosenLang:
            chosenLang[row[0]] = {}
        chosenLang[row[0]][row[1]] = row[3]

# the language code is the last 2 characters of the file name
langCode = chosenCsv[len(chosenCsv) - 6:len(chosenCsv) - 4]

# create the directory for the language code, if it doesn't already exist
if not os.path.exists(reactPath + langCode):
    os.makedirs(reactPath + langCode)

# for each file name in the data, create a .json file with the key/values
for jsonFile in chosenLang:
    print('Creating ' + langCode + '/' + jsonFile)
    jsonObject = json.dumps(chosenLang[jsonFile], indent=4, ensure_ascii=False)
    with open(os.path.join(reactPath + langCode, jsonFile), 'w', encoding='utf8') as outfile:
        outfile.write(jsonObject)

print('Json import complete!')
print(os.getcwd() + '/' + reactPath + langCode)
