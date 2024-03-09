import { GithubUser } from "./github-user.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("User already exists");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("User not found!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");

      this.add(value);
    };
  }

  update() {
    this.displayRowIfHasNoData();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Image of ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Do you really want to delete this row?");

        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td class="user" colspan="4">
      <img
        src="https://github.com/diego3g.png"
        alt="User avatar image"
      />
      <a href="https://github.com/diego3g" target="_blank">
        <p>Diego Fernandes</p>
        <span>diego3g</span>
      </a>
    </td>
    <td class="repositories">78</td>
    <td class="followers">9500</td>
    <td><button class="remove">Remove</button></td>
    `;

    tr.classList.add("row");

    return tr;
  }

  displayRowIfHasNoData() {
    const amountOfData = this.entries.length;
    const appClassList = this.root.classList;

    appClassList.add("hasNoData");
    this.removeAllTr();

    if (amountOfData > 0) appClassList.remove("hasNoData");
  }

  removeAllTr() {
    this.root.classList;
    this.tbody.querySelectorAll(".row").forEach((row) => {
      row.remove();
    });
  }
}
