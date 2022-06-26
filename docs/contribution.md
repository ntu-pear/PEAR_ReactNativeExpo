# Contributing

We :heart: PRs!

Pull Requests are the way to contribute into our repository for all changes even docs!

Please follow this guide to contribute to our project.

## Filing Issues and Feature Requests

Our project is currently managed in Trello (https://trello.com/b/i6t7NLzF/pear-fyp-sprint-board). Please file issues and feature requests in the discussion page.

## GitHub Flow

We use the GitHub flow with Pull Requests to contribute to our repository. Here are some PR tips that have worked great for us, and we try to follow as much as possible:

* 1 Feature = 1 Branch.

* [Not Implemented Yet] All PRs must pass all verification checks (lint, unit tests, etc...) and be code reviewed before merging to a maintained branch.

  * When a PR is ready to be reviewed, please tag it with the `Ready to Review` label.

  * The local Git repo install will add by default a `pre-push` hook that will run many of these checks locally.

* There is no restriction to the number of PRs you create to merge changes into another PR. In fact, you are encouraged to do this, as it will keep code reviews small and merging more agile. Remember, there is a significant correlation between software quality and the size of a merge.

* If possible, try to get your friends to review your code. It's always good to learn from mistakes or suggestions.

* PR titles should have the format:
  * `[Card-nnn] Description` if they are associated with a Trello item in the MDK project.
  * `[BUG-nnn] Description` if they are associated with an Incident or bug.
  * `[Doc] Description` if they are purely documentation e.g. metadata-schema update
  This way the log is uniform and easy to traverse.
  * `[Refactor] Description` For refactoring of code/ improvement of code base and similar tasks

### Branch Naming

In order to help keep the repository organized and make the patch process easier, the team has settled on the following branch naming strategy.

Branches should always have meaningful names which include the Trello item if any.

| Branch Name | Purpose |
|-------------|---------|
| `feature/Card-XXXX/meaningful-branch-name` | New features |
| `bug/Card-XXXX/meaningful-branch-name` | Bugs and fixes |
| `refactor/Card-XXXX/meaningful-branch-name` | Code refactoring |
| `doc/Card-XXXX/meaningful-branch-name` | Documentation changes |
| `hotfix/Card-xxxx/meaningful-branch-name` | If the branch is being used to create a PR where the base branch of the PR is a “release branch” |