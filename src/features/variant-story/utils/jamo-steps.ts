const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

// "움" → ["", "ㅇ", "우", "움"]. 자음·모음이 하나씩 붙는 중간 상태를 모두 만든다.
// 지울 때는 이 배열을 거꾸로 돌려서 백스페이스처럼 자모 단위로 지워진다.
// shortcut: 겹받침·이중모음(ㄳ, ㅘ)은 한 번에 붙는다. 현재 단어에는 없어서 필요해지면 자모를 더 쪼갠다.
export function jamoSteps(word: string): string[] {
  const out = [""];
  let done = "";
  for (const ch of word) {
    const parts = [...ch.normalize("NFD")];
    for (let k = 1; k <= parts.length; k++) {
      const part = parts.slice(0, k).join("");
      const code = part.charCodeAt(0);
      // 첫 자음 하나만 있을 때는 호환 자모(ㅇ)로 바꿔야 낱글자로 보인다.
      const shown = k === 1 && code >= 0x1100 && code <= 0x1112 ? CHOSEONG[code - 0x1100] : part.normalize("NFC");
      out.push(done + shown);
    }
    done += ch;
  }
  return out;
}
