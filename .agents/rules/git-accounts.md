# Multi-Account GitHub Switching & Contribution Attribution

This machine has multiple GitHub accounts configured with `gh auth`:
- `dumass-dev` -> Email: `shuaib.melekodesseri@gmail.com`
- `shuaib-mk` -> Email: `shuaibmk985@gmail.com`
- (and any additional account added via `gh auth login`)

## MANDATORY PROCEDURE FOR COMMITTING & PUSHING:
Whenever the user specifies or implies which account to commit or push from — in ANY phrasing or words (e.g., "push from dumass-dev", "push this project to https://... using dumass-dev", "upload as shuaib-mk", "commit and push with account X"):

1. **Switch active GitHub CLI credentials:**
   `gh auth switch --user <account>`

2. **Configure Git author name and email in the local repo:**
   - For `dumass-dev`:
     `git config user.name "dumass-dev" ; git config user.email "shuaib.melekodesseri@gmail.com"`
   - For `shuaib-mk`:
     `git config user.name "shuaib-mk" ; git config user.email "shuaibmk985@gmail.com"`

3. **Verify and re-author unpushed commits:**
   Before pushing, always check that the unpushed commit author matches the requested account. If existing commits were authored by another account or email, re-author them so ONLY the chosen account appears as the contributor and author:
   `git commit --amend --reset-author --no-edit`

4. **Target Remote:**
   If the user provides a repo URL (or the repo URL belongs to the target account), ensure the remote origin is set correctly:
   `git remote set-url origin <repo_url>` (or `git remote add origin <repo_url>`)

5. **Push to remote:**
   `git push origin <branch>` (use `--force` if commits were amended).
