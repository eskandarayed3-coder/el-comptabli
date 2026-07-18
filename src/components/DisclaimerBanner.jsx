import { useT } from '../i18n/index.js';

export default function DisclaimerBanner({ text }) {
  const { t } = useT();
  return <p className="disclaimer">{text || t('disclaimer')}</p>;
}
