import style from "./Preview.module.css";

function Preview() {
  return (
    <section className={style.preview}>
      <div className={style.preview__content}>
        <h1>Finmap</h1>
        <p>Понимай, куда уходят деньги</p>
      </div>
    </section>
  );
}

export default Preview;
