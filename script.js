const handleFileUpload = (inputId, expectedFileName) => {
	const fileInput = document.getElementById(inputId)
	const label = document.querySelector(`label[for="${inputId}"]`)
	const icon = label.querySelector("i")

	fileInput.addEventListener("change", () => {
		if (!fileInput.files.length) return

		const file = fileInput.files[0]

		// Validasi nama file
		if (file.name !== expectedFileName) {
			alert(`Invalid file name. Expected: ${expectedFileName}`)
			fileInput.value = "" // Reset input
			return
		}

		// Ubah tampilan tombol upload setelah file dipilih
		label.classList.add("uploaded")
		icon.classList.replace("bx-upload", "bx-check")
		label.innerHTML = `<i class="bx bx-check"></i> File Uploaded`
	})
}

handleFileUpload("followersFile", "followers_1.json")
handleFileUpload("followingFile", "following.json")

document.getElementById("checkButton").addEventListener("click", async () => {
	const followersFile = document.getElementById("followersFile").files[0]
	const followingFile = document.getElementById("followingFile").files[0]
	const resultSection = document.getElementById("results")

	if (!followersFile || !followingFile) {
		alert("Please upload both followers and following JSON files.")
		return
	}

	const followersData = await followersFile.text()
	const followersJson = JSON.parse(followersData)
	const followers = []
	followersJson.forEach((group) => {
		group.string_list_data.forEach((item) => {
			followers.push(item.value)
		})
	})

	const followingData = await followingFile.text()
	const followingJson = JSON.parse(followingData)
	const following = []
	followingJson.relationships_following.forEach((group) => {
		group.string_list_data.forEach((item) => {
			following.push(item.value)
		})
	})

	localStorage.setItem("followers", JSON.stringify(followers))
	localStorage.setItem("following", JSON.stringify(following))

    const notFollowingBack = following.filter((user) => !followers.includes(user))
    
    const notFollowingBackValue = document.getElementById("not-following-back-value")
    notFollowingBackValue.textContent = notFollowingBack.length

    const resultsDiv = document.getElementById("results-list")
	if (notFollowingBack.length === 0) {
		resultsDiv.innerHTML += `<p>Great! Everyone you follow is following you back.</p>`
	} else {
		notFollowingBack.forEach((user) => {
			const userLink = `https://www.instagram.com/${user}`
			resultsDiv.innerHTML += `<p>${user} - <a href="${userLink}" target="_blank">Profile</a></p>`
		})
		resultSection.classList.remove("hidden")
	}
})

document.getElementById("resetButton").addEventListener("click", () => {
	document.getElementById("followersFile").value = ""
	document.getElementById("followingFile").value = ""

	localStorage.removeItem("followers")
	localStorage.removeItem("following")

	document.getElementById("results-list").innerHTML = ""

	// Reset tampilan tombol upload
	document.querySelectorAll(".button-upload").forEach((label) => {
		label.classList.remove("uploaded")
		const icon = label.querySelector("i")
		if (icon) {
			icon.classList.replace("bx-check", "bx-upload") // Kembalikan ikon
		}
		label.innerHTML = `<i class="bx bx-upload"></i> Upload file` // Kembalikan teks
	})

	alert("Data has been reset. Please upload files again.")

	document.getElementById("results").classList.add("hidden")
})

window.addEventListener("load", () => {
	if (localStorage.getItem("followers") && localStorage.getItem("following")) {
		document.getElementById("followersFile").value = ""
		document.getElementById("followingFile").value = ""
		localStorage.removeItem("followers")
		localStorage.removeItem("following")
		document.getElementById("results").innerHTML = ""
	}
})
