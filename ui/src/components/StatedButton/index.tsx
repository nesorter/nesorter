import styles from './styles.module.css';

type Props = {
  state: boolean;
  onClick: (nextState: boolean) => void;
  children: JSX.Element | string;
}

export const StatedButton = ({ state, onClick, children }: Props) => {
  return (
    <button
      className={[styles.btn, styles[state.toString()]].join(' ')}
      onClick={() => onClick(!state)}
    >{children}</button>
  );
}
