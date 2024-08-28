import { colors } from '@/utils/colors';
import '@/utils/toast.scss';
import _ from 'lodash';
import { Notyf } from 'notyf';

const notyf = new Notyf({
  ripple: false,
  types: [
    {
      type: 'info',
      background: colors.brand3.hex,
      icon: false,
    },
  ],
});

export function toast(message, options = {}) {
  options = _.merge(
    {
      duration: 5000,
      position: {
        x: 'center',
        y: 'bottom',
      },
    },
    options,
  );

  const notification = notyf.open({ type: 'info', message, ...options });
  notification.on('click', () => notyf.dismiss(notification));
  return notification;
}
