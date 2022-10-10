import { useTranslation } from 'react-i18next';
import Translate from '../components/ui/svg/Translate';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex items-center justify-start gap-4 p-4 hover:bg-slate-200 hover:text-black">
      <Translate />
      <select
        className="bg-gray-500 focus:outline-none text-white hover:bg-slate-200 hover:text-black"
        value={i18n.language}
        onChange={e => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}
export default LanguageSwitcher;
