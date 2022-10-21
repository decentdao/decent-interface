## Contributing to Fractal Interface

### Submitting an Issue

- Some issues may already be reported, please search existing issues before submitting a new one.

- Otherwise, simply create a new issue and the Fractal development team will respond in a timely manner. Please be as descriptive of the issue as possible.

- If looking to contribute a bug fix or feature contribution, please discuss the change via the bug ticket or a new Github issue before submitting a pull request for the greatest likelihood of being accepted.

### Submitting a Pull Request

- Follow our [README](https://github.com/decent-dao/fractal-interface/blob/HEAD/README.md) for instructions on setting up your local environment.

- Open a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) with your proposed changes.

- Include a link to the relevant GitHub Issue in your description.

- If possible, please provide unit or integration tests for your changes. You can see example
  automation tests in the [test directory](https://github.com/decent-dao/fractal-interface/tree/HEAD/tests).
  
- All of your components should be composed of [Chakra UI](https://chakra-ui.com/) base components, using our custom theme.

- A member of the Fractal engineering team will respond with any further discussion or requested changes and once approved
  you are free to merge.
  
- We appreciate the collaboration!

### Submitting Language Translations

- Languages we are actively seeking translations for will appear as a Github Issue, though we always appreciate other
  submissions.  If we don't currently support your language, please help us out!

- Run the `1_json_to_csv.py` [Python 3](https://www.python.org/downloads/) script with your [2 character ISO language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) to get a helpful CSV file of missing strings in your language:
  ```console
  python3 1_json_to_csv.py
  ```

- Add your translations in the last column of the output CSV file.  Feel free to improve existing translations!

- When finished translating, run `2_csv_to_json.py` to generate the required `.json` files for the Fractal app:
  ```console
  python3 2_csv_to_json.py
  ```

- Submit a pull request with these changes, as detailed above in _Submitting a Pull Request_.

- We encourage anyone to try cloning the Fractal repo and submitting a PR with translations (you can definitely do it!), however if you get stuck the Fractal team can provide you with a CSV to edit and return to us, simply add your request to the related Github issue.
