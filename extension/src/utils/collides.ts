
export function collides(DOMRectA: DOMRect, DOMRectB: DOMRect): boolean {
    return !(
        DOMRectA.top > DOMRectB.bottom ||
        DOMRectA.bottom < DOMRectB.top ||
        DOMRectA.left > DOMRectB.right ||
        DOMRectA.right < DOMRectB.left
    );
}
