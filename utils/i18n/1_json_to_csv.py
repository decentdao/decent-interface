from pathlib import Path
import json
import csv
import os

reactPath = 'src/i18n/locales/'

def main():

	# if we're running from the script directory, run from the base repo directory instead
	if os.path.exists(os.path.basename(__file__)):
		os.chdir("../..")

	# get a list of currently supported languages, and remove English
	supportedLangs  = [f.name for f in Path(reactPath).iterdir() if f.is_dir()]
	supportedLangs.remove('en')
	
	# user input menu, to get the 2 char language code they would like to translate for
	while True:
		chosenLangCode = input('Input language code ' + str(supportedLangs) + ': ').lower()
		if chosenLangCode in ['exit', 'quit']:
			quit()
		if chosenLangCode == 'en':
			print('We already have English!')
			quit()
		if len(chosenLangCode) != 2:
			print('Please enter a 2 character ISO language code (https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)')
			continue
		if chosenLangCode in supportedLangs:
			break
		confirm = input('Are you sure this is your 2 character ISO language code (https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)? ').lower()
		if confirm in ['y', 'yes']:
			break;

	# get the json files as dictionaries
	englishJson = getJsonData('en')
	chosenJson = getJsonData(chosenLangCode)

	filename = 'output_' + chosenLangCode + '.csv'
	output = open(filename, 'w')
	csvWriter = csv.writer(output)

	headers = ['json file (do not edit)', 'String key (do not edit)', 'English (do not edit)', chosenLangCode + ' (please edit this column)']
	csvWriter.writerow(headers)

	missingStrings = False

	# write each key/value as a csv row with {json file name},{string key},{English text},{chosen language text}
	# e.g. common.json,labelYes,Yes,Sí
	for jsonFile in englishJson:
		for stringKey in englishJson[jsonFile]:
			chosenLangString = chosenJson[jsonFile][stringKey] if (jsonFile in chosenJson) and (stringKey in chosenJson[jsonFile]) else ''
			if chosenLangString == '':
				missingStrings = True
			csvWriter.writerow([jsonFile, stringKey, englishJson[jsonFile][stringKey], chosenLangString])

	output.close()
	print('Output to: ' + os.getcwd() + '/' + filename)
	print('There ARE missing strings!' if missingStrings else 'NO missing strings! Party!')

# gets the existing json translation files for the given language as a dictionary of dictionaries
# e.g. {'common.json': {'accept': 'Acepto'}, 'daoCreate.json': {'buttonCreate': 'Crear un Fractal'}}
def getJsonData(langCode):
	if not os.path.exists(reactPath + langCode):
		os.makedirs(reactPath + langCode)

	jsonFiles  = [f for f in Path(reactPath + langCode).iterdir() if f.name.endswith('.json')]
	data = {}
	for file in jsonFiles:
		openFile = open(file)
		data[file.name] = json.load(openFile)
		openFile.close()
	return data

main()
