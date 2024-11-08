let depth = 0;
history.replaceState({ depth: depth }, "");

window.addEventListener("hashchange", (event) => {
  if (history.state === null) {
    const oldHash = URL.parse(event.oldURL).hash;
    const newHash = URL.parse(event.newURL).hash;
    document
      .querySelector(
        `screen-body${
          oldHash === "" ? ":not([id])" : oldHash
        } *[href="${newHash}"]`
      )
      ?.setAttribute("followed", "");
    depth += 1;
    history.replaceState({ depth: depth }, "");
  } else {
    depth = history.state.depth;
  }
});
