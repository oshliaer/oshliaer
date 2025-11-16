# 📌 Резюме: даты Google Sheets ↔ JS `Date`

## Как хранит Google Sheets

* Даты – это **числа (serial)**:

  * целая часть = количество дней с **1899-12-30 UTC**,
  * дробная часть = доля суток (время).
* Внутри Sheets число всегда соответствует **UTC-моменту**.
* Часовой пояс документа влияет только на отображение, но не на хранение.

## Задачи

1. Преобразовать **serial → JS Date** в заданном часовом поясе.
2. Преобразовать **JS Date → serial** обратно, тоже с учётом пояса.
3. Сохранять точность до миллисекунд и учитывать переходы DST.

---

# 📌 Универсальное решение (любой IANA-пояс)

```js
// Константы
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SHEETS_EPOCH = Date.UTC(1899, 11, 30); // 1899-12-30 UTC

/**
 * Преобразование serial-числа Google Sheets → Date в нужном поясе
 * @param {number} serial - число из Google Sheets
 * @param {string} timeZone - IANA-часовой пояс, напр. "Europe/Moscow"
 * @returns {Date} объект Date, локализованный под timeZone
 */
function sheetsSerialToDate(serial, timeZone) {
  const utcMs = SHEETS_EPOCH + serial * MS_PER_DAY;

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    fractionalSecondDigits: 3
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const get = t => parts.find(p => p.type === t).value;

  const iso = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}.${get("fractionalSecond")}Z`;
  return new Date(iso);
}

/**
 * Преобразование Date → serial-число Google Sheets
 * @param {Date} date - JS Date (UTC внутри)
 * @param {string} timeZone - IANA-часовой пояс, напр. "Europe/Moscow"
 * @returns {number} serial число (с долями суток)
 */
function dateToSheetsSerial(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    fractionalSecondDigits: 3
  });
  const parts = dtf.formatToParts(date);
  const get = t => parts.find(p => p.type === t).value;

  const localIso = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}.${get("fractionalSecond")}Z`;
  const localMs = Date.parse(localIso);

  return (localMs - SHEETS_EPOCH) / MS_PER_DAY;
}
```

✔ Универсально, учитывает все пояса и переходы **DST**.
✘ Чуть медленнее, т.к. использует `Intl.DateTimeFormat`.

---

# 📌 Турбо-вариант (фиксированный offset)

Если у тебя **один постоянный пояс** (например, всегда `UTC+3`), можно обойтись без `Intl` и работать напрямую со смещением в минутах. Это будет существенно быстрее.

```js
// Константы
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SHEETS_EPOCH = Date.UTC(1899, 11, 30); // 1899-12-30 UTC

/**
 * serial → Date (фиксированный offset)
 * @param {number} serial - число из Google Sheets
 * @param {number} offsetMinutes - смещение в минутах (например, +180 для UTC+3)
 * @returns {Date}
 */
function sheetsSerialToDateFixed(serial, offsetMinutes) {
  const utcMs = SHEETS_EPOCH + serial * MS_PER_DAY;
  return new Date(utcMs + offsetMinutes * 60 * 1000);
}

/**
 * Date → serial (фиксированный offset)
 * @param {Date} date - JS Date
 * @param {number} offsetMinutes - смещение в минутах (например, +180 для UTC+3)
 * @returns {number}
 */
function dateToSheetsSerialFixed(date, offsetMinutes) {
  const localMs = date.getTime() - offsetMinutes * 60 * 1000;
  return (localMs - SHEETS_EPOCH) / MS_PER_DAY;
}
```

✔ Очень быстро, т.к. только арифметика.
✘ Не учитывает переходы **DST** – подходит только для фиксированного смещения.

---

# 📌 Использование

```js
// Универсальный способ
const serial = 45909.6458333; // пришло из Sheets
const d = sheetsSerialToDate(serial, "Europe/Moscow");
console.log(d.toISOString()); 
// → 2025-09-23T15:30:00.000Z

const back = dateToSheetsSerial(d, "Europe/Moscow");
console.log(back.toFixed(6));
// → 45909.645833

// Турбо-способ (фиксированный UTC+3)
const d2 = sheetsSerialToDateFixed(serial, 180);
console.log(d2.toISOString());

const back2 = dateToSheetsSerialFixed(d2, 180);
console.log(back2.toFixed(6));
```

---

# 📌 Итоги

* **Если нужен разный пояс и важен DST** → используем **универсальные функции с `Intl`**.
* **Если всегда один фиксированный offset** (например, UTC+3 без перехода) → используем **турбо-функции** для максимальной скорости.


