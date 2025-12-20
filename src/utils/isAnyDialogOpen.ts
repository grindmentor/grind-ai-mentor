export function isAnyDialogOpen(root: ParentNode = document): boolean {
  // Radix Dialog/AlertDialog:
  // - Overlay/content typically carry data-state="open"
  // - Content often has role="dialog" or role="alertdialog"
  // - Some builds add data-radix-dialog-content / data-radix-alert-dialog-content
  return Boolean(
    root.querySelector(
      '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-state="open"][data-radix-dialog-content], [data-state="open"][data-radix-alert-dialog-content]'
    )
  );
}
