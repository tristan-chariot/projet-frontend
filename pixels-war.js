const adresse = document.querySelector("#adresse").value;
const carte = document.querySelector("#map").value;
const couleur = document.querySelector("#couleur").value;
console.log({ adresse, carte, couleur })

const mapElement = document.querySelector("#mapcontainer")

async function preinit() {
    const res = await fetch(`${adresse}/api/v1/${carte}/preinit`, { credentials: "include" });
    const { key } = await res.json();
    init(key)
}


async function init(key) {
    const res = await fetch(`${adresse}/api/v1/${carte}/init?key=${key}`, { credentials: "include" });
    const { id, nx, ny, timeout, data } = await res.json()

    let contenu = "";
    for (let col = 0; col < nx; col++) {
        for (let li = 0; li < ny; li++) {
            const [r, g, b] = data[li][col];
            contenu += `<div class="pixel" id="l${li}_c${col}" style="background-color: rgb(${r}, ${g}, ${b})"></div>`;
        }

        mapElement.innerHTML = contenu;
        mapElement.style.setProperty('--colonnes', nx);
        mapElement.style.setProperty('--lignes', ny);

        console.log(contenu);

        setInterval(() => deltas(id), 1000);


        document.querySelectorAll(".pixel").forEach(pixel => {
            pixel.addEventListener("click", async (click) => {
                const idPixel = click.target.id;
                const posPixel = idPixel.match(/l(\d+)_c(\d+)/)
                const li = posPixel[1]
                const col = posPixel[2]
                const [r, g, b] = getPickedColorInRGB()
                const res = await fetch(`${adresse}/api/v1/${carte}/set/${id}/${li}/${col}/${r}/${g}/${b}`, { credentials: "include" })
                const resultat = await res.json();

                if (resultat == 0) {
                    deltas(id);
                }
                else {
                    const tempsattente = Math.round(resultat / 10 ** 9);
                    alert(`Vous devez patienter ${tempsattente} secondes avant de pouvoir changer la couleur d'un pixel.`);
                }
            })
        })
    }


}


async function deltas(id) {
    const res = await fetch(`${adresse}/api/v1/${carte}/deltas?id=${id}`, { credentials: "include" })
    const { deltas } = await res.json();
    for ([x, y, r, g, b] of deltas) {
        console.log("delta", [x, y, r, g, b]);
        const pixel = document.querySelector(`#l${x}_c${y}`);
        pixel.style.backgroundColor = `rgb(${r},${g},${b})`;
    }
}


function getPickedColorInRGB() {
    const colorHexa = document.getElementById("couleur").value

    const r = parseInt(colorHexa.substring(1, 3), 16)
    const g = parseInt(colorHexa.substring(3, 5), 16)
    const b = parseInt(colorHexa.substring(5, 7), 16)

    return [r, g, b]
}



document.addEventListener("DOMContentLoaded", () => {
    const carte = document.querySelector("#map").value;
    const description = document.querySelector("#description-carte");
    description.textContent = `Bienvenue sur la carte ${carte} !`;
});



preinit()


const description = document.querySelector("#map-description");
description.textContent = `Bienvenue sur la carte ${carte} !`;
