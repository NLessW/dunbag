document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "wwzdQOhIa5pdbgj5zPZubOMQBhB7miR2";

  function selectMenu(menuType) {
    document.querySelectorAll(".menu-btn").forEach((btn) => {
      btn.classList.remove("bg-blue-600", "hover:bg-blue-700");
      btn.classList.add("bg-gray-800", "hover:bg-gray-700");
    });

    const selectedBtn = document.querySelector(`[data-menu="${menuType}"]`);
    selectedBtn.classList.remove("bg-gray-800", "hover:bg-gray-700");
    selectedBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
  }

  function checkWeapon(weapon) {
    const enchant = weapon.enchant?.status;
    const allElementalStrength = enchant?.some(
      (stat) => stat.name === "모든 속성 강화" && stat.value >= 15
    );

    const elementalStrengths = enchant?.filter((stat) =>
      stat.name.includes("속성 강화")
    );
    const isElementalStrong = elementalStrengths?.every(
      (stat) => stat.value >= 15
    );

    const attackPower = enchant?.filter((stat) =>
      ["물리 공격력", "마법 공격력", "독립 공격력"].includes(stat.name)
    );

    let enchantResult = "미달";
    if (allElementalStrength) {
      const isFinalWeapon = attackPower?.every((stat) => stat.value >= 30);
      enchantResult = isFinalWeapon ? "종결" : "준종결";
    } else if (isElementalStrong) {
      enchantResult = "준종결";
    }

    const asrahanOption = weapon.asrahanOption;

    if (!asrahanOption || !asrahanOption.options) {
      return {
        enchant: enchantResult,
        cluster: { value: 0, diff: -20, status: "미달" },
        memory: { value: 0, diff: -5, status: "미달" },
        firstTrace: { value: 0, diff: -6, status: "미달" },
      };
    }

    const clusterOption = asrahanOption.options.find((opt) => opt.step);
    const memoryDestination = asrahanOption.options.find(
      (opt) => opt.name === "기억의 종착지"
    );
    const firstTrace = asrahanOption.options.find(
      (opt) => opt.name === "첫 기억으로의 자취"
    );

    const clusterValue = clusterOption ? clusterOption.step : 0;
    const memoryValue = memoryDestination ? memoryDestination.step : 0;
    const firstTraceValue = firstTrace ? firstTrace.step : 0;

    const clusterDiff = clusterValue - 20;
    const memoryDiff = memoryValue - 5;
    const firstTraceDiff = firstTraceValue - 6;

    return {
      enchant: enchantResult,
      cluster: {
        value: clusterValue,
        diff: clusterDiff,
        status: clusterDiff >= 0 ? "종결" : "미달",
      },
      memory: {
        value: memoryValue,
        diff: memoryDiff,
        status: memoryDiff >= 0 ? "종결" : "미달",
      },
      firstTrace: {
        value: firstTraceValue,
        diff: firstTraceDiff,
        status: firstTraceDiff >= 0 ? "종결" : "미달",
      },
    };
  }
  function checkArmor(armor) {
    const { explain, status } = armor.enchant || {};
    const finalDamageExplain = explain?.includes("최종 데미지");
    const attackPower = status?.find(
      (stat) => stat.name === "물리 공격력" || stat.name === "마법 공격력"
    );
    const strengthOrIntellect = status?.find(
      (stat) => stat.name === "힘" || stat.name === "지능"
    );

    if (armor.slotName === "머리어깨" || armor.slotName === "신발") {
      if (finalDamageExplain && explain.includes("2% 증가")) return "종결";
      if (finalDamageExplain && explain.includes("1% 증가")) return "준종결";
    } else if (armor.slotName === "상의") {
      if (
        (finalDamageExplain && explain.includes("1% 증가")) ||
        (attackPower &&
          attackPower.value >= 110 &&
          strengthOrIntellect &&
          strengthOrIntellect.value >= 80)
      ) {
        return "종결";
      }
      if (
        attackPower &&
        attackPower.value >= 90 &&
        strengthOrIntellect &&
        strengthOrIntellect.value >= 60
      ) {
        return "준종결";
      }
    } else if (armor.slotName === "하의") {
      if (
        attackPower &&
        attackPower.value >= 110 &&
        strengthOrIntellect &&
        strengthOrIntellect.value >= 80
      ) {
        return "종결";
      }
      if (
        attackPower &&
        attackPower.value >= 90 &&
        strengthOrIntellect &&
        strengthOrIntellect.value >= 60
      ) {
        return "준종결";
      }
    } else if (armor.slotName === "벨트") {
      if (
        finalDamageExplain &&
        (explain.includes("2% 증가") || explain.includes("3% 증가"))
      )
        return "종결";
      if (finalDamageExplain && explain.includes("1% 증가")) return "준종결";
    }

    return "미달";
  }

  function checkAccessories(access) {
    const { explain, status } = access.enchant || {};
    const finalDamageExplain = explain?.includes("최종 데미지");

    const elementalStrengths = status?.filter((stat) =>
      stat.name.includes("속성강화")
    );

    const hasElementalStrengthOver33 = elementalStrengths?.some(
      (stat) => stat.value >= 33
    );

    if (
      (access.slotName === "팔찌" ||
        access.slotName === "목걸이" ||
        access.slotName === "반지") &&
      access.slotName !== "칭호"
    ) {
      if (finalDamageExplain && explain.includes("1% 증가")) {
        return "종결";
      }
      if (hasElementalStrengthOver33) {
        return "준종결";
      } else {
        return "미달";
      }
    }

    console.log("미달: 조건에 맞지 않음");
    return "미달";
  }

  function displayResults(equipment) {
    const weaponStats = document.getElementById("weapon-stats");
    const armorStats = document.getElementById("armor-stats");
    const accessStats = document.getElementById("accessory-stats");
    weaponStats.innerHTML = "";
    armorStats.innerHTML = "";
    accessStats.innerHTML = "";

    const weapons = equipment.filter((item) => item.itemType === "무기");
    weapons.forEach((weapon) => {
      const evaluation = checkWeapon(weapon);

      const itemDiv = document.createElement("div");
      itemDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      itemDiv.innerHTML = `<strong>${weapon.itemName}</strong>`;
      weaponStats.appendChild(itemDiv);

      const enchantDiv = document.createElement("div");
      enchantDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      enchantDiv.innerHTML = `마부 - <span class="font-bold">${evaluation.enchant}</span>`;
      weaponStats.appendChild(enchantDiv);

      const clusterDiv = document.createElement("div");
      clusterDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      const clusterInfo = evaluation.cluster;
      clusterDiv.innerHTML = `성단 - ${clusterInfo.value} (${
        clusterInfo.diff >= 0 ? "+" : ""
      }${clusterInfo.diff}) - <span class="font-bold">${
        clusterInfo.status
      }</span>`;
      weaponStats.appendChild(clusterDiv);

      const memoryDiv = document.createElement("div");
      memoryDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      const memoryInfo = evaluation.memory;
      memoryDiv.innerHTML = `종착지 - ${memoryInfo.value} (${
        memoryInfo.diff >= 0 ? "+" : ""
      }${memoryInfo.diff}) - <span class="font-bold">${
        memoryInfo.status
      }</span>`;
      weaponStats.appendChild(memoryDiv);

      const firstTraceDiv = document.createElement("div");
      firstTraceDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      const firstTraceInfo = evaluation.firstTrace;
      firstTraceDiv.innerHTML = `기억 - ${firstTraceInfo.value} (${
        firstTraceInfo.diff >= 0 ? "+" : ""
      }${firstTraceInfo.diff}) - <span class="font-bold">${
        firstTraceInfo.status
      }</span>`;
      weaponStats.appendChild(firstTraceDiv);
    });

    const armors = equipment.filter((item) => item.itemType === "방어구");
    armors.forEach((armor) => {
      const evaluation = checkArmor(armor);

      const itemDiv = document.createElement("div");
      itemDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      itemDiv.innerHTML = `${armor.itemName} - <span class="font-bold">${evaluation}</span>`;
      armorStats.appendChild(itemDiv);
    });

    const access = equipment.filter(
      (item) => item.itemType === "액세서리" && item.slotName !== "칭호"
    );
    access.forEach((acces) => {
      const evaluation = checkAccessories(acces);
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      itemDiv.innerHTML = `${acces.itemName} - <span class="font-bold">${evaluation}</span>`;
      accessStats.appendChild(itemDiv);
    });

    document.getElementById("results-container").classList.remove("hidden");
  }

  function showError(message) {
    const errorMessage = document.getElementById("error-message");
    if (message) {
      errorMessage.textContent = message;
      errorMessage.classList.remove("hidden");
    } else {
      errorMessage.textContent = "";
      errorMessage.classList.add("hidden");
    }
  }

  function fetchData(server, characterName) {
    const url = `/api/fetchData?server=${server}&characterName=${characterName}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          showError(data.message);
        } else {
          showError(null);
          displayResults(data);
        }
      })
      .catch((error) => showError("API 호출에 실패했습니다." + error));
  }

  document.getElementById("searchBtn").addEventListener("click", handleSearch);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  function handleSearch() {
    const serverSelect = document.querySelector("select");
    const characterInput = document.querySelector("input[type='text']");
    const server = serverSelect.value;
    const characterName = characterInput.value.trim();

    if (server && characterName) {
      fetchData(server, characterName);
    } else {
      showError("서버와 캐릭터명을 입력해주세요.");
    }
  }
});
