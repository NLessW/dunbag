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

  function checkSpecial(special) {
    const enchantStatus = special.enchant?.status;
    const allAttrEnchant = enchantStatus.find(
      (status) => status.name === "모든 속성 강화"
    );
    if (special.slotName === "보조장비") {
      if (!enchantStatus) return "미달";
      if (!allAttrEnchant) return "미달";
      const enchantValue = Number(allAttrEnchant.value);
      return enchantValue >= 12 ? "종결" : "미달";
    } else if (special.slotName === "마법석") {
      const enchantValue = Number(allAttrEnchant.value);
      if (enchantValue === 35) return "종결";
      if (enchantValue === 30) return "준종결";
      else return "미달";
    } else if (special.slotName === "귀걸이") {
      const enchantValue = Number(allAttrEnchant.value);
      if (enchantValue === 15) return "종결";
      if (enchantValue === 11) return "준종결";
      else return "미달";
    }
    return "미달";
  }
  function checkSetName(weapon, access, armor) {
    if (!weapon || !access || !armor) {
      return "알 수 없는 세팅";
    }

    console.log(armor);
    if (
      (weapon.itemName && weapon.itemName.includes("木")) ||
      (weapon.itemName && weapon.itemName.includes("첫 새싹"))
    )
      return "각몰";
    if (
      access.itemName.includes("딥 다이버 워치") &&
      (!access.itemName.includes("木") || !access.itemName.includes("첫 새싹"))
    ) {
      return "딥다팔";
    }

    if (
      access.slotName === "팔찌" &&
      access.itemName.includes("흑화의 구속 팔찌") &&
      armor.slotName === "신발" &&
      armor.itemName.includes("경계를 넘어선 차원")
    ) {
      return "TP출혈";
    }
    if (
      access.slotName === "팔찌" &&
      access.itemName.includes("흑화의 구속 팔찌")
    ) {
      return "출혈";
    }

    if (
      access.slotName === "팔찌" &&
      access.itemName.includes("생명이 담긴 가죽 토시") &&
      armor.slotName === "신발" &&
      armor.itemName.includes("경계를 넘어선 차원")
    ) {
      return "TP감전";
    }

    if (
      access.slotName === "팔찌" &&
      access.itemName.includes("생명이 담긴 가죽 토시")
    ) {
      return "감전";
    }
    if (
      access.itemName.includes("억제된 마력의 팔찌") &&
      (armor.itemName.includes("딥 다이버 슈즈") ||
        armor.itemName.includes("사이버틱 스피드 부츠"))
    ) {
      return "공칸";
    }

    if (access.itemName.includes("억제된 마력의 팔찌")) {
      return "아칸";
    }

    if (access.itemName.includes("파워 네비게이트 팩")) {
      return "짭칸";
    }

    return "알 수 없는 세팅";
  }
  function displayResults(equipment) {
    const weaponStats = document.getElementById("weapon-stats");
    const armorStats = document.getElementById("armor-stats");
    const accessStats = document.getElementById("accessory-stats");
    const specialStats = document.getElementById("special-stats");
    const setEquipmentDiv = document.getElementById("set-equipment");

    weaponStats.innerHTML = "";
    armorStats.innerHTML = "";
    accessStats.innerHTML = "";
    specialStats.innerHTML = "";
    setEquipmentDiv.innerHTML = "";

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

    const addEquip = equipment.filter((item) => item.itemType === "추가장비");
    addEquip.forEach((special) => {
      const evaluation = checkSpecial(special);
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      itemDiv.innerHTML = `${special.itemName} - <span class="font-bold">${evaluation}</span>`;
      specialStats.appendChild(itemDiv);
    });

    if (weapons.length > 0 && access.length > 0 && armors.length > 0) {
      const weapon = weapons[0];
      const accesss = access[1];
      const armor = armors[3];

      const setName = checkSetName(weapon, accesss, armor);

      const setDiv = document.createElement("div");
      setDiv.classList.add(
        "p-8",
        "bg-gray-700",
        "rounded-lg",
        "mb-2",
        "flex",
        "justify-center",
        "items-center"
      );
      setDiv.innerHTML = `<span class="font-bold text-xl text-center">${setName}</span>`;
      setEquipmentDiv.appendChild(setDiv);
    }

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
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          showError(data.message);
          return null;
        } else {
          showError(null);
          return data;
        }
      })
      .catch((error) => {
        showError("API 호출에 실패했습니다." + error);
        return null;
      });
  }

  function formatKoreanNumber(number) {
    const cleanNumberStr =
      typeof number === "string" ? number.replace(/,/g, "") : number.toString();

    const koreanUnits = ["", "만", "억", "조"];

    const bigIntNumber = BigInt(cleanNumberStr);

    const groups = [];

    let remainingNumber = bigIntNumber;
    while (remainingNumber > 0n) {
      const group = remainingNumber % 10000n;
      groups.unshift(group);

      remainingNumber = remainingNumber / 10000n;
    }

    const koreanFormatted = groups
      .map((group, index) => {
        const groupNum = Number(group);

        return groupNum > 0
          ? `${groupNum.toLocaleString().replace(/,/g, "")}${
              koreanUnits[groups.length - index - 1]
            }`
          : "";
      })
      .filter((part) => part !== "")
      .slice(0, 2)
      .join(" ");

    return koreanFormatted;
  }

  function fetchDundamData(server, characterName, characterId) {
    fetch("/api/postToDundam", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Content-Type": "application/json",
        Origin: "https://dundam.xyz",
        Referer: "https://dundam.xyz/character",
        "sec-ch-ua":
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ server, characterName, characterId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const rankDamage = data.damageList.vsRanking.find(
          (e) => e.name === "총 합"
        ).dam;

        const powerScoreElement = document.getElementById("power-score");
        powerScoreElement.innerHTML = `${rankDamage}<br>(${formatKoreanNumber(
          rankDamage
        )})`;
      })
      .catch((error) => {
        console.error("API 호출 중 오류 발생:", error);
      });
  }
  function fetchBuffSwitchData(server, characterName) {
    fetch(`/api/buffSwitch?server=${server}&characterName=${characterName}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("API 호출에 실패했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        displayBuffSwitchData(data);
      })
      .catch((error) => {
        console.error("BuffSwitch 데이터 가져오기 실패:", error);
      });
  }

  function displayBuffSwitchData(data) {
    const switchBuffContainer = document.getElementById("switch-Buff");
    switchBuffContainer.innerHTML = "";

    if (data && data.length > 0) {
      data.forEach((item) => {
        const skillNameDiv = document.createElement("div");
        skillNameDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
        skillNameDiv.innerHTML = `<strong>${item.name}</strong> : ${item.buffLevel}`;

        const buffLevelDiv = document.createElement("div");
        buffLevelDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");

        let levelText;
        if (item.levelDifference === 10) {
          levelText = `버프 레벨 : +${item.levelDifference} (${item.percentage}%) - 종결`;
        } else {
          levelText = `버프 레벨 : ${item.levelDifference > 0 ? "+" : ""}${
            item.levelDifference
          } (${item.percentage}%) - 미달`;
        }

        buffLevelDiv.innerHTML = levelText;

        switchBuffContainer.appendChild(skillNameDiv);
        switchBuffContainer.appendChild(buffLevelDiv);
      });
    } else {
      const noDataDiv = document.createElement("div");
      noDataDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      switchBuffContainer.appendChild(noDataDiv);
    }
  }
  document.getElementById("searchBtn").addEventListener("click", handleSearch);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  async function handleSearch() {
    const serverSelect = document.querySelector("select");
    const characterInput = document.querySelector("input[type='text']");
    const server = serverSelect.value;
    const characterName = characterInput.value.trim();

    if (server && characterName) {
      const data = await fetchData(server, characterName);
      if (data && data.length > 0) {
        const characterId = data[0].characterId;
        fetchDundamData(server, characterName, characterId);
        displayResults(data);

        fetchBuffSwitchData(server, characterName);
      } else {
        showError("캐릭터 데이터를 가져올 수 없습니다.");
      }
    } else {
      showError("서버와 캐릭터명을 입력해주세요.");
    }
  }
});
