type OperatorLoginProps = {
  onLogin: (pin: string) => Promise<void>;
  error?: string | null;
};

export function OperatorLogin({ onLogin, error }: OperatorLoginProps) {
  return (
    <form
      className="operator-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const pin = new FormData(form).get('pin');
        if (typeof pin === 'string' && pin.length > 0) {
          await onLogin(pin);
        }
      }}
    >
      <h2>Operador</h2>
      <label htmlFor="operator-pin">PIN</label>
      <input id="operator-pin" name="pin" type="password" autoComplete="off" />
      {error ? <p className="operator-error">{error}</p> : null}
      <button type="submit" className="primary-button">
        Entrar
      </button>
    </form>
  );
}
