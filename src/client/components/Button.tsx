import styled from 'styled-components';

import theme from '@/client/theme';

interface StyledButtonProps {
  children: React.ReactNode | string;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'small';
}

export const Button = styled.button<StyledButtonProps>`
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  min-width: 46px;
  background-color: ${(props) =>
    props.variant === 'primary' ? theme.colors.green100 : theme.colors.dark200};
  color: ${theme.colors.textLight}
  height: ${(props) => (props.size === 'normal' ? '32px' : '24px')}
  padding: ${(props) => (props.size === 'normal' ? '2px 10px' : '2px 8px')}
  font-size: ${(props) => (props.size === 'normal' ? '14px' : '12px')}
`;

export const StatedButton = (props: {
  flag: boolean;
  onNextState: (nextFlag: boolean) => unknown;
  children: React.ReactNode | string;
  size?: StyledButtonProps['size'];
}) => {
  return (
    <Button
      variant={props.flag ? 'primary' : 'secondary'}
      onClick={() => props.onNextState(!props.flag)}
      size={props.size || 'normal'}
    >
      {props.children}
    </Button>
  );
};
