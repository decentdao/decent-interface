## Contributing Language Translations

### Submitting Language Translations

- Languages we are actively seeking translations for will appear as a [Github Issue](https://github.com/decent-dao/fractal-interface/labels/translation), though we always appreciate other
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

- Submit a pull request with these changes, as detailed in [CONTRIBUTING.md](./CONTRIBUTING.md).

- We encourage anyone to try cloning the Fractal repo and submitting a PR with translations (you can definitely do it!), however if you get stuck the Fractal team can provide you with a CSV to edit and return to us, simply add your request to the related Github issue.

### Translation Guidelines

- The app name is Fractal, which is a project of Decent DAO.  Unless used as their non product specific meanings (e.g. John is a decent fellow who loves fractals.), these words should not be translated.

- Content within curly brackets (e.g. `{{count}}`), indicates a variable that is replaced within the app logic, and neither the brackets, nor the content within should be altered. _You may place these bracketed variables anywhere in your translation text_.

- Some English text in the app uses ALL CAPS for emphasis. If your language does not have capitalized letters but does have some equivalent way to emphasize text, please do so.

- Gnosis Safe, Gnosis, and the capitalized word Safe are products of [Gnosis](https://gnosis.io/) and should not be translated.

- Etherscan, CoinGecko, and ENS (Ethereum Name Service) are additional web3 products that are mentioned, and should not be translated.

- The acronyms / abbreviation DAO (Decentralized Autonomous Organizatino), NFT (Non-Fungible Token), and ETH (Ether), should not be translated.

- The words _block_, _token_, _chain_, and _transaction_ have specific meanings within the Ethereum and web3 space. Please be sure to understand their contextual meaning, if you have any doubts please raise a question in the Github issue!

- If you have ANY other questions or would like more context on specific text, feel free to reach out!