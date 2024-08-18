export function formatTime(milliseconds: number, падеж: 'именительный' | 'родительский' = 'именительный'): string {
  const totalMinutes = Math.floor(milliseconds / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const second = Math.floor(milliseconds / 1000) % 60;

  let hourWords: [string, string, string];
  let minuteWords: [string, string, string];
  let secondWords: [string, string, string];

  switch (падеж) {
    case 'именительный':
      hourWords = ['час', 'часа', 'часов'];
      minuteWords = ['минута', 'минуты', 'минут'];
      secondWords = ['секунда', 'секунды', 'секунд'];
      break;
    case 'родительский':
      hourWords = ['часа', 'часов', 'часов'];
      minuteWords = ['минуты', 'минут', 'минут'];
      secondWords = ['секунды', 'секунд', 'секунд'];
      break;
  }

  const hourWord = getCorrectWord(hours, hourWords);
  const minuteWord = getCorrectWord(minutes, minuteWords);
  const secondWord = getCorrectWord(second, secondWords);

  if (hours > 0) {
    if (minutes > 0) {
      if (second > 0) {
        return `${hours} ${hourWord} ${minutes} ${minuteWord} ${second} ${secondWord}`;
      } else {
        return `${hours} ${hourWord} ${minutes} ${minuteWord}`;
      }
    } else if (second > 0) {
        return `${hours} ${hourWord} ${second} ${secondWord}`;
      } else {
        return `${hours} ${hourWord}`;
      }
  } else if (minutes > 0) {
      if (second > 0) {
        return `${minutes} ${minuteWord} ${second} ${secondWord}`;
      } else {
        return `${minutes} ${minuteWord}`;
      }
    } else {
      return `${second} ${secondWord}`;
    }
}

export function formatHours(hours: number) {
  return getCorrectWord(hours, ['час', 'часа', 'часов']);
}

export function getCorrectWord(number: number, words: [string, string, string]): string {
  if (number % 10 === 1 && number % 100 !== 11) {
    return words[0];
  } else if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
    return words[1];
  } else {
    return words[2];
  }
}
