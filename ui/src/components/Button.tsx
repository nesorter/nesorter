import styled from "styled-components";
import { space, variant } from "styled-system";

interface StyledButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
  size: 'normal' | 'small';
}

export const Button = styled.button<StyledButtonProps>`
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  min-width: 46px;

  ${space}
  ${variant({
    variants: {
      primary: {
        backgroundColor: 'green100',
        color: 'textLight'
      },
      secondary: {
        backgroundColor: 'dark200',
        color: 'textLight'
      }
    }
  })}
  ${variant({
    prop: 'size',
    variants: {
      normal: {
        padding: '2px 10px',
        height: '32px',
        fontSize: '14px'
      },
      small: {
        padding: '2px 8px',
        height: '24px',
        fontSize: '12px'
      },
    }
  })}
`;

export const StatedButton = (props: { 
  flag: boolean, 
  onNextState: (nextFlag: boolean) => unknown, 
  children: React.ReactNode,
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
}
