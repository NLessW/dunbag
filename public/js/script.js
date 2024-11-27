document.addEventListener("DOMContentLoaded", () => {
  const resultsContainer = document.getElementById("results-container");
  const errorMessage = document.getElementById("error-message");
  const weaponStats = document.getElementById("weapon-stats");
  const armorStats = document.getElementById("armor-stats");
  const accessStats = document.getElementById("accessory-stats");
  const specialStats = document.getElementById("special-stats");
  const setEquipmentDiv = document.getElementById("set-equipment");
  const powerScoreElement = document.getElementById("power-score");
  const switchBuffContainer = document.getElementById("switch-Buff");

  function selectMenu(menuType) {
    const menuBtns = document.querySelectorAll(".menu-btn");
    menuBtns.forEach((btn) => {
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

    if (!asrahanOption?.options) {
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

    const clusterValue = clusterOption?.step || 0;
    const memoryValue = memoryDestination?.step || 0;
    const firstTraceValue = firstTrace?.step || 0;

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

    const { slotName } = armor;

    if (slotName === "머리어깨" || slotName === "신발") {
      if (finalDamageExplain && explain.includes("2% 증가")) return "종결";
      if (finalDamageExplain && explain.includes("1% 증가")) return "준종결";
    } else if (slotName === "상의" || slotName === "하의") {
      if (
        (slotName === "상의" &&
          finalDamageExplain &&
          explain.includes("1% 증가")) ||
        (attackPower?.value >= 110 && strengthOrIntellect?.value >= 80)
      ) {
        return "종결";
      }
      if (attackPower?.value >= 90 && strengthOrIntellect?.value >= 60) {
        return "준종결";
      }
    } else if (slotName === "벨트") {
      if (finalDamageExplain && explain.match(/[23]% 증가/)) return "종결";
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
      ["팔찌", "목걸이", "반지"].includes(access.slotName) &&
      access.slotName !== "칭호"
    ) {
      if (finalDamageExplain && explain.includes("1% 증가")) return "종결";
      if (hasElementalStrengthOver33) return "준종결";
      return "미달";
    }

    return "미달";
  }

  function checkSpecial(special) {
    const enchantStatus = special.enchant?.status;
    const allAttrEnchant = enchantStatus?.find(
      (status) => status.name === "모든 속성 강화"
    );

    if (!enchantStatus || !allAttrEnchant) return "미달";

    const enchantValue = Number(allAttrEnchant.value);
    const { slotName } = special;

    if (slotName === "보조장비") {
      return enchantValue >= 12 ? "종결" : "미달";
    } else if (slotName === "마법석") {
      if (enchantValue === 35) return "종결";
      if (enchantValue === 30) return "준종결";
    } else if (slotName === "귀걸이") {
      if (enchantValue === 15) return "종결";
      if (enchantValue === 11) return "준종결";
    }

    return "미달";
  }

  function checkSetName(weapon, access, armor1, armor2) {
    if (!weapon || !access || !armor1 || !armor2) return "알 수 없는 세팅";

    const { itemName: weaponName } = weapon || {};
    const { itemName: accessName, slotName: accessSlot } = access || {};
    const { itemName: armorName1, slotName: armorSlot1 } = armor1 || {};
    const { itemName: armorName2, slotName: armorSlot2 } = armor2 || {};

    if (weaponName?.includes("木") || weaponName?.includes("첫 새싹"))
      return "각몰";
    if (
      accessName?.includes("딥 다이버 워치") &&
      !accessName?.includes("木") &&
      !accessName?.includes("첫 새싹")
    )
      return "딥다팔";
    if (accessSlot === "팔찌") {
      if (accessName?.includes("흑화의 구속 팔찌")) {
        return armorSlot1 === "신발" &&
          armorName1?.includes("경계를 넘어선 차원")
          ? "TP출혈"
          : "출혈";
      }
      if (accessName?.includes("생명이 담긴 가죽 토시")) {
        return armorSlot1 === "신발" &&
          armorName1?.includes("경계를 넘어선 차원")
          ? "TP감전"
          : "감전";
      }
      if (accessName?.includes("억제된 마력의 팔찌")) {
        return armorName1?.includes("딥 다이버 슈즈") ||
          armorName1?.includes("사이버틱 스피드 부츠")
          ? "공칸"
          : "아칸";
      }
      if (accessName?.includes("파워 네비게이트 팩")) return "짭칸";
      if (accessName?.includes("불가침") || accessName?.includes("구속된 자유"))
        return "무큐과소모";
      if (accessName?.includes("리플레이서")) return "마나과소모";
      if (accessName?.includes("골렘의 핵 팔찌")) {
        return armorSlot1 === "신발" &&
          armorName1?.includes("경계를 넘어선 차원")
          ? "TP중독"
          : "중독";
      }
      if (accessName?.includes("포인트 레이더 암릿")) {
        if (
          armorSlot1 === "신발" &&
          armorName1?.includes("경계를 넘어선 차원")
        ) {
          return "TP화상";
        } else if (
          armorSlot2 === "벨트" &&
          armorName2?.includes("영면을 위한 준비")
        ) {
          return "얼녹";
        } else {
          return "화상";
        }
      }
      if (accessName?.includes("오랜 시간 품어온 소원")) return "수면";
      if (accessName?.includes("찬란한 금장 팔찌")) return "4상변";
      if (
        accessName?.includes("무한한 영감") ||
        accessName?.includes("총사령관의 섬멸 작전") ||
        accessName.includes("미지의 비늘 암릿") ||
        accessName.includes("순례자를 짓누르는 무게")
      )
        return "기억/흔적";
    }

    return "알 수 없는 세팅";
  }

  function displayResults(equipment) {
    weaponStats.innerHTML = "";
    armorStats.innerHTML = "";
    accessStats.innerHTML = "";
    specialStats.innerHTML = "";
    setEquipmentDiv.innerHTML = "";

    const weapons = equipment.filter((item) => item.itemType === "무기");
    const armors = equipment.filter((item) => item.itemType === "방어구");
    const access = equipment.filter(
      (item) => item.itemType === "액세서리" && item.slotName !== "칭호"
    );
    const addEquip = equipment.filter((item) => item.itemType === "추가장비");

    const missingItems = [];

    let isAnyWeaponIncomplete = false;

    weapons.forEach((weapon) => {
      const evaluation = checkWeapon(weapon);
      const createStatDiv = (content) => {
        const div = document.createElement("div");
        div.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
        div.innerHTML = content;
        return div;
      };

      weaponStats.appendChild(
        createStatDiv(`<strong>${weapon.itemName}</strong>`)
      );
      weaponStats.appendChild(
        createStatDiv(
          `마부 - <span class="font-bold">${evaluation.enchant}</span>`
        )
      );

      const stats = [
        { name: "성단", info: evaluation.cluster },
        { name: "종착지", info: evaluation.memory },
        { name: "기억", info: evaluation.firstTrace },
      ];

      stats.forEach(({ name, info }) => {
        weaponStats.appendChild(
          createStatDiv(
            `${name} - ${info.value} (${info.diff >= 0 ? "+" : ""}${
              info.diff
            }) - <span class="font-bold">${info.status}</span>`
          )
        );
      });

      const isWeaponIncomplete =
        evaluation.enchant === "미달" ||
        evaluation.cluster.status === "미달" ||
        evaluation.memory.status === "미달" ||
        evaluation.firstTrace.status === "미달";

      if (isWeaponIncomplete) {
        isAnyWeaponIncomplete = true;
      }
    });

    if (isAnyWeaponIncomplete) {
      missingItems.push("무기 - 미달");
    }

    const createItemDiv = (item, evaluation) => {
      const div = document.createElement("div");
      div.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      div.innerHTML = `${item.itemName} - <span class="font-bold">${evaluation}</span>`;
      return div;
    };

    armors.forEach((armor) => {
      const evaluation = checkArmor(armor);
      armorStats.appendChild(createItemDiv(armor, evaluation));
      if (evaluation === "미달") {
        missingItems.push(`${armor.itemName}`);
      }
    });

    access.forEach((acc) => {
      const evaluation = checkAccessories(acc);
      accessStats.appendChild(createItemDiv(acc, evaluation));
      if (evaluation === "미달") {
        missingItems.push(`${acc.itemName}`);
      }
    });

    addEquip.forEach((special) => {
      const evaluation = checkSpecial(special);
      specialStats.appendChild(createItemDiv(special, evaluation));
      if (evaluation === "미달") {
        missingItems.push(`${special.itemName}`);
      }
    });

    if (weapons.length && access.length && armors.length) {
      const setName = checkSetName(weapons[0], access[1], armors[3], armors[4]);
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

    const missingItemsElement = document.getElementById("missing-items");
    missingItemsElement.innerHTML = missingItems.length
      ? `<span style="font-size: 0.875rem;">${missingItems.join("<br>")}</span>`
      : "-";

    resultsContainer.classList.remove("hidden");
  }

  function showError(message) {
    if (message) {
      errorMessage.textContent = message;
      errorMessage.classList.remove("hidden");
    } else {
      errorMessage.textContent = "";
      errorMessage.classList.add("hidden");
    }
  }

  function fetchData(server, characterName) {
    return fetch(
      `/api/fetchData?server=${server}&characterName=${characterName}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          showError(data.message);
          return null;
        }
        showError(null);
        return data;
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
      groups.unshift(remainingNumber % 10000n);
      remainingNumber /= 10000n;
    }

    return groups
      .map((group, index) => {
        const groupNum = Number(group);
        return groupNum > 0
          ? `${groupNum}${koreanUnits[groups.length - index - 1]}`
          : "";
      })
      .filter(Boolean)
      .slice(0, 2)
      .join(" ");
  }

  function fetchDundamData(server, characterName, characterId) {
    fetch("/api/postToDundam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ server, characterName, characterId }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const rankDamage = data.damageList.vsRanking.find(
          (e) => e.name === "총 합"
        ).dam;
        powerScoreElement.style.display = "flex";
        powerScoreElement.style.flexDirection = "column";
        powerScoreElement.style.justifyContent = "center";
        powerScoreElement.style.alignItems = "center";
        powerScoreElement.innerHTML = `${rankDamage}<br>(${formatKoreanNumber(
          rankDamage
        )})`;
      })
      .catch((error) => console.error("API 호출 중 오류 발생:", error));
  }

  function fetchBuffSwitchData(server, characterName) {
    fetch(`/api/buffSwitch?server=${server}&characterName=${characterName}`)
      .then((response) => {
        if (!response.ok) throw new Error("API 출에 실패했��다.");
        return response.json();
      })
      .then(displayBuffSwitchData)
      .catch((error) =>
        console.error("BuffSwitch 데이터 가져오기 실패:", error)
      );
  }

  function displayBuffSwitchData(data) {
    switchBuffContainer.innerHTML = "";

    if (!data?.length) {
      const noDataDiv = document.createElement("div");
      noDataDiv.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
      switchBuffContainer.appendChild(noDataDiv);
      return;
    }

    data.forEach((item) => {
      const createBuffDiv = (content) => {
        const div = document.createElement("div");
        div.classList.add("p-2", "bg-gray-700", "rounded-lg", "mb-2");
        div.innerHTML = content;
        return div;
      };

      switchBuffContainer.appendChild(
        createBuffDiv(`<strong>${item.name}</strong> : ${item.buffLevel}`)
      );

      const levelText =
        item.levelDifference === 10
          ? `버프 레벨 : +${item.levelDifference} (${item.percentage}%) - 종결`
          : `버프 레벨 : ${item.levelDifference > 0 ? "+" : ""}${
              item.levelDifference
            } (${item.percentage}%) - 미달`;

      switchBuffContainer.appendChild(createBuffDiv(levelText));
    });
  }

  async function handleSearch() {
    const server = document.querySelector("select").value;
    const characterName = document
      .querySelector("input[type='text']")
      .value.trim();

    if (!server || !characterName) {
      showError("서버와 캐릭터명을 입력해주세요.");
      return;
    }

    const data = await fetchData(server, characterName);
    if (data?.length) {
      const characterId = data[0].characterId;
      fetchDundamData(server, characterName, characterId);
      displayResults(data);
      fetchBuffSwitchData(server, characterName);
    } else {
      showError("캐릭터 데이터를 가져올 수 없습니다.");
    }
  }

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
});
