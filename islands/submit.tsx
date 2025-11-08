export function Query(props: { pathname: string; name: string }) {
  return (
    <form action={props.pathname}>
      <label htmlFor="inputUrl">Type the pdf's URL:</label>
      <br />
      <input
        type="url"
        id="inputUrl"
        name={props.name}
        required
        placeholder="https://example.com/example.pdf"
        size={100}
      />
      <br />
      <button type="submit">submit</button>
    </form>
  );
}

export function FormData(props: { pathname: string; name: string }) {
  return (
    <form
      method="post"
      encType="multipart/form-data"
      action={props.pathname}
    >
      <label htmlFor="inputFile">Choose a pdf file</label>
      <input
        type="file"
        id="inputFile"
        name={props.name}
        accept=".pdf"
        hidden
        style="display: none"
        onChange={(e) => e.currentTarget.form!.submit()}
      />
    </form>
  );
}
