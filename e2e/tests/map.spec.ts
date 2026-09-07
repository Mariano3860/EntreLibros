import { test, expect } from "../fixtures/auth";
import { expectRealApiMode } from "../support/helpers";

test("permite explorar el mapa real y conservar sus acciones principales", async ({
  userAPage,
}) => {
  await userAPage.goto("/map");
  await expectRealApiMode(userAPage);

  const map = userAPage.getByRole("region", {
    name: /Mapa de rincones y actividad cercana/i,
  });
  await expect(map).toBeVisible();
  await expect(userAPage.getByRole("searchbox")).toBeVisible();
  await expect(
    userAPage.getByRole("slider", { name: /Radio geogr/i }),
  ).toBeVisible();

  const search = userAPage.getByRole("searchbox");
  await search.fill("Palermo");
  await expect(search).toHaveValue("Palermo");

  await userAPage.getByRole("button", { name: "Abiertos ahora" }).click();
  await expect(
    userAPage.getByRole("button", { name: "Abiertos ahora" }),
  ).toHaveAttribute("aria-pressed", "true");

  const locationButton = userAPage.getByRole("button", {
    name: /Centrar en mi ubic/i,
  });
  await userAPage.context().grantPermissions(["geolocation"]);
  await userAPage.context().setGeolocation({
    latitude: -34.5884,
    longitude: -58.4116,
  });
  await locationButton.click();

  await userAPage.getByRole("button", { name: /Crear rinc/i }).click();
  const createDialog = userAPage.getByRole("dialog", {
    name: /Crear Rinc.n de Libros/i,
  });
  await expect(createDialog).toBeVisible();
  await createDialog
    .getByRole("button", { name: /Cancelar/i })
    .first()
    .click();

  await userAPage.setViewportSize({ width: 760, height: 800 });
  const filters = userAPage.locator("aside[aria-label*='Filtros']");
  await expect(filters).toBeVisible();
  await userAPage.getByRole("button", { name: /Ocultar filtros/i }).click();
  await expect(filters).toHaveAttribute("aria-hidden", "true");
  await userAPage.getByRole("button", { name: /Mostrar filtros/i }).click();
  await expect(filters).toHaveAttribute("aria-hidden", "false");
});

test("expone un estado honesto cuando el area no tiene rincones", async ({
  userAPage,
}) => {
  await userAPage.goto("/map");
  await expectRealApiMode(userAPage);
  await expect(
    userAPage.getByText(/Ajust.*filtros o explor.*barrios cercanos/i),
  ).toBeVisible();
  await expect(
    userAPage.getByText(/No hay rincones que coincidan con estos filtros/i),
  ).toBeVisible();
});
