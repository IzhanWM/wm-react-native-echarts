import type { Meta } from '@storybook/react';
import { AvatarStack } from '@components/ui-widgets/avatarstack/avatarstack';
import { widgetDecorator } from '../widget-decorator';
import { avatarStackArgTypes } from './avatarstack.args';

export default {
  title: 'UI Widgets/Avatar Stack/Appearance',
  component: AvatarStack,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ...avatarStackArgTypes,
  },
  decorators: [widgetDecorator()],
} satisfies Meta<typeof AvatarStack>;
