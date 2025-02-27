import userEvent from "@testing-library/user-event";
import { render, screen } from "test-utils";
import { rest, server } from "../../../testServer";
import UnlockModal from "../UnlockModal";

const handleClose = vi.fn();

describe("UnlockModal", () => {
  const setup = () => {
    render(<UnlockModal onClose={handleClose} />);
  };

  test("renders", () => {
    setup();

    const input = screen.getByPlaceholderText("forms.validation.unlock.pass_c");
    expect(input).toHaveClass("input-underline");
    expect(input).toBeInTheDocument();
  });

  test("should enable button if input is not empty", async () => {
    const user = userEvent.setup();
    setup();

    const input = screen.getByPlaceholderText("forms.validation.unlock.pass_c");
    const button = screen.getByRole("button", {
      name: "wallet.unlock",
    });
    expect(button).toBeDisabled();

    await user.type(input, "1234");
    expect(button).toBeEnabled();
  });

  test("should show text on wrong password", async () => {
    server.use(
      rest.post("/api/v1/lightning/unlock-wallet", (_, res, ctx) => {
        return res(ctx.status(401));
      })
    );

    const user = userEvent.setup();
    setup();

    const input = screen.getByPlaceholderText("forms.validation.unlock.pass_c");
    await user.type(input, "1234");
    await user.click(screen.getByText("wallet.unlock"));

    expect(await screen.findByText("login.invalid_pass")).toBeInTheDocument();
  });

  test("should display unlocking text on unlock", async () => {
    server.use(
      rest.post("/api/v1/lightning/unlock-wallet", (_, res, ctx) => {
        return res(ctx.status(200));
      })
    );

    const user = userEvent.setup();
    setup();

    const input = screen.getByPlaceholderText("forms.validation.unlock.pass_c");
    await user.type(input, "1234");
    await user.click(await screen.findByText("wallet.unlock"));

    expect(await screen.findByText("wallet.unlocking")).toBeInTheDocument();
  });
});
