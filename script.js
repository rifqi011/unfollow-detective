// Fungsi untuk menyimpan data ke localStorage
const saveDataToLocalStorage = (key, data) => {
	localStorage.setItem(key, JSON.stringify(data))
}

// Fungsi untuk mengambil data dari localStorage
const getDataFromLocalStorage = (key) => {
	const data = localStorage.getItem(key)
	return data ? JSON.parse(data) : null
}

// Fungsi untuk menghapus data dari localStorage
const clearLocalStorageData = () => {
	localStorage.removeItem("followers")
	localStorage.removeItem("following")
}

// Fungsi untuk menangani perubahan input file
const handleFileUpload = (inputId, expectedFileName, storageKey) => {
	const fileInput = document.getElementById(inputId)
	const label = document.querySelector(`label[for="${inputId}"]`)
	const icon = label.querySelector("i")

	fileInput.addEventListener("change", async () => {
		if (!fileInput.files.length) return

		const file = fileInput.files[0]

		// Validasi nama file
		if (file.name !== expectedFileName) {
			alert(`Invalid file name. Expected: ${expectedFileName}`)
			fileInput.value = ""
			return
		}

		// Baca dan simpan data ke localStorage
		const fileData = await file.text()
		saveDataToLocalStorage(storageKey, JSON.parse(fileData))

		// Ubah tampilan tombol upload setelah file dipilih
		label.classList.add("uploaded")
		icon.classList.replace("bx-upload", "bx-check")
		label.innerHTML = `<i class="bx bx-check"></i> File Uploaded`
	})
}

handleFileUpload("followersFile", "followers_1.json", "followers")
handleFileUpload("followingFile", "following.json", "following")

// Fungsi untuk memproses data dan mencari akun yang tidak mengikuti balik
const processData = () => {
	const followersJson = getDataFromLocalStorage("followers")
	const followingJson = getDataFromLocalStorage("following")
	const resultSection = document.getElementById("results")
	const howtoSection = document.getElementById("howto")

	if (!followersJson || !followingJson) return

	try {
		const followers = []
		followersJson.forEach((group) => {
			group.string_list_data.forEach((item) => {
				followers.push(item.value)
			})
		})

		const following = []
		followingJson.relationships_following.forEach((group) => {
			group.string_list_data.forEach((item) => {
				following.push(item.value)
			})
		})

		// Simpan data dalam format array ke localStorage
		saveDataToLocalStorage("followers", followers)
		saveDataToLocalStorage("following", following)

		// Mencari akun yang tidak mengikuti balik
		const notFollowingBack = following.filter((user) => !followers.includes(user))
		saveDataToLocalStorage("notFollowingBack", notFollowingBack)

		// Tampilkan hasil
		displayResults(notFollowingBack)

		resultSection.classList.remove("hidden")
		howtoSection.classList.add("hidden")
	} catch (error) {
		alert("An error occurred while processing the files. Please check the file format.")
		console.error(error)
	}
}

// Fungsi untuk menampilkan hasil
const displayResults = (notFollowingBack) => {
	const notFollowingBackValue = document.getElementById("not-following-back-value")
	const resultsList = document.getElementById("results-list")

	notFollowingBackValue.textContent = notFollowingBack.length
	resultsList.innerHTML = ""

	if (notFollowingBack.length === 0) {
		resultsList.innerHTML = `<p>Great! Everyone you follow is following you back.</p>`
	} else {
		notFollowingBack.forEach((user) => {
			const userLink = `https://www.instagram.com/${user}`
			resultsList.innerHTML += `
                <li class="result-item flex-row">
                    <p class="result-name">@${user}</p>
                    <a href="${userLink}" target="_blank" class="button-primary result-button">View</a>
                </li>`
		})
		resultsList.classList.remove("hidden")
	}
}

// Jika tombol "Check" ditekan
document.getElementById("checkButton").addEventListener("click", processData)

// Jika tombol "Reset" ditekan
document.getElementById("resetButton").addEventListener("click", () => {
	document.getElementById("followersFile").value = ""
	document.getElementById("followingFile").value = ""
	clearLocalStorageData()
	document.getElementById("results-list").innerHTML = ""

	document.querySelectorAll(".button-upload").forEach((label) => {
		label.classList.remove("uploaded")
		const icon = label.querySelector("i")
		if (icon) {
			icon.classList.replace("bx-check", "bx-upload")
		}
		label.innerHTML = `<i class="bx bx-upload"></i> Upload file`
	})

	alert("Data has been reset. Please upload files again.")
	document.getElementById("results").classList.add("hidden")
	document.getElementById("howto").classList.remove("hidden")
})

// Memuat ulang hasil saat halaman direfresh
window.addEventListener("load", () => {
	const notFollowingBack = getDataFromLocalStorage("notFollowingBack")
	if (notFollowingBack) {
		displayResults(notFollowingBack)
		document.getElementById("results").classList.remove("hidden")
		document.getElementById("howto").classList.add("hidden")
	}
})
