window.ssdi_debug = true;

function SSDI_time() {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");

	return `[${hours}:${minutes}:${seconds}]`;
}

function SSDI_log(message, type = "log") {
	if (window.ssdi_debug) console[type](SSDI_time() + " SSDI:", message);
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForElement(selector, timeout = 5000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const element = document.querySelector(selector);
		if (element) return element;
		await wait(100); // Проверка каждые 100 мс
	}
	throw new Error(`Элемент ${selector} не найден в течение ${timeout} мс`);
}

(async function () {
	SSDI_log("Запуск скрипта...", "info");

	try {
		const row = await waitForElement(".row.select_inventory_container");
		SSDI_log("Контейнер с кнопками действий найден...");

		const select = await waitForElement(".sih_button_2.sih_select_inventory_button");
		SSDI_log("Кнопка выбора предметов найдена...");

		const all = await waitForElement(".sih_button_2.sih_select_all_inventory_button");
		SSDI_log("Кнопка выбора всех предметов найдена...");

		SSDI_log("Все элементы найдены, создаем кнопку...", "info");

		const dublicate = document.createElement("a");
		dublicate.innerText = "ВЫБРАТЬ ДУБЛИКАТЫ";
		dublicate.href = "javascript:void(0);";
		dublicate.className = "sih_button_2 ssdi_dublicate_inventory_button";

		dublicate.onclick = function () {
			select.click();
			
			const itemList = {};
			const clickedItems = {};

			document.querySelectorAll(".inventory_page .itemHolder").forEach(item => {
				const img = item.querySelector("img");
				if (img) {
					const src = img.getAttribute("src");
					if (src) {
						itemList[src] = (itemList[src] || 0) + 1;
					}
				}
			});

			const totalItems = Object.values(itemList).reduce((sum, count) => sum + count, 0);
			const duplicateItems = Object.values(itemList).filter(count => count > 1).reduce((sum, count) => sum + count, 0);
			SSDI_log(`Найдено ${totalItems} предметов, из них ${duplicateItems} дубликатов`, "info");

			document.querySelectorAll(".inventory_page .itemHolder").forEach(item => {
				const link = item.querySelector("a[href]");
				const img = item.querySelector("img");
				if (link && img) {
					const src = img.getAttribute("src");
					if (src && itemList[src] > 1) {
						if (!clickedItems[src]) {
							clickedItems[src] = true;
						} else {
							// Кликаем на последующие совпадения
							link.click();
						}
					}
				}
			});

		};
		SSDI_log("Ивент кнопки выбора дубликатов установлена...");

		all.after(dublicate);
		SSDI_log("Все готово, кнопка выбора дубликатов создана", "info");
	} catch (error) {
		SSDI_log(error.message, "error");
	}
})();