function StarFilled() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 18.26L4.94704 22.208L6.52204 14.28L0.587036 8.792L8.61404 7.84L12 0.5L15.386 7.84L23.413 8.792L17.478 14.28L19.053 22.208L12 18.26Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarEmpty() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 18.26L4.947 22.208L6.522 14.28L0.586998 8.792L8.614 7.84L12 0.5L15.386 7.84L23.413 8.792L17.478 14.28L19.053 22.208L12 18.26ZM12 15.968L16.247 18.345L15.298 13.572L18.871 10.267L14.038 9.694L12 5.275L9.962 9.695L5.129 10.267L8.702 13.572L7.753 18.345L12 15.968V15.968Z"
        fill="currentColor"
      />
    </svg>
  );
}

export { StarFilled, StarEmpty };
