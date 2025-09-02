const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs/promises');
const path = require('path');

// This is a placeholder service. In a real application, this would be far more robust.
// It would handle file paths, security (shell injection), and error handling much more carefully.
const REPO_BASE_PATH = path.join(__dirname, '../../repositories');

class GitService {
    /**
     * Initializes a new bare Git repository on the filesystem.
     * @param {string} username - The owner's username.
     * @param {string} repoName - The name of the repository.
     */
    static async initializeRepo(username, repoName) {
        const userRepoPath = path.join(REPO_BASE_PATH, username);
        const fullRepoPath = path.join(userRepoPath, `${repoName}.git`);

        console.log(`[GitService] Initializing bare repository at: ${fullRepoPath}`);

        try {
            // Create the user's directory if it doesn't exist
            await fs.mkdir(userRepoPath, { recursive: true });
            
            // Initialize a bare git repository
            const { stdout, stderr } = await exec(`git init --bare "${fullRepoPath}"`);
            
            if (stderr) {
                console.error(`[GitService] Stderr on init: ${stderr}`);
            }
            console.log(`[GitService] Repo initialized successfully: ${stdout}`);
            return true;
        } catch (error) {
            console.error(`[GitService] Failed to initialize repository for ${username}/${repoName}:`, error);
            // In a real app, you might want to roll back the database entry if this fails.
            throw new Error('Could not initialize Git repository on the server.');
        }
    }

    /**
     * Deletes a Git repository from the filesystem.
     * @param {string} username - The owner's username.
     * @param {string} repoName - The name of the repository.
     */
    static async deleteRepo(username, repoName) {
        const fullRepoPath = path.join(REPO_BASE_PATH, username, `${repoName}.git`);
        console.log(`[GitService] Deleting repository at: ${fullRepoPath}`);

        try {
            await fs.rm(fullRepoPath, { recursive: true, force: true });
            console.log(`[GitService] Repository at ${fullRepoPath} deleted successfully.`);
            return true;
        } catch (error) {
            console.error(`[GitService] Failed to delete repository for ${username}/${repoName}:`, error);
            // This error is serious as it leaves orphaned files. It should be logged and monitored.
            throw new Error('Could not delete Git repository from the server.');
        }
    }
}

module.exports = GitService;
