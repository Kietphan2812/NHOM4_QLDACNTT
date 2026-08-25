/* ==========================================================================
   NHÓM 4 - JENKINS CI/CD PIPELINE & SLACK AUTOMATED WEBHOOKS
   Interactive Pipeline Simulation & Slack Error Notification Stream
   ========================================================================== */

let devopsState = {
  isBuilding: false,
  simulateFail: false,
  buildNumber: 142
};

document.addEventListener('DOMContentLoaded', () => {
  initDevOps();
});

function initDevOps() {
  renderSlackMessage('SUCCESS', 141, 'master', 'Nguyễn Văn A', 'Pipeline #141 deployed successfully to AWS EKS production cluster.');
}

function toggleSimulateFail(checkbox) {
  devopsState.simulateFail = checkbox.checked;
  showToast(checkbox.checked ? 'Đã BẬT giả lập lỗi Build trong quy trình Pipeline' : 'Đã TẮT giả lập lỗi Build', checkbox.checked ? 'warning' : 'info');
}

function triggerJenkinsBuild() {
  if (devopsState.isBuilding) {
    showToast('Pipeline đang chạy, vui lòng chờ hoàn tất!', 'warning');
    return;
  }

  devopsState.isBuilding = true;
  devopsState.buildNumber++;
  const buildNum = devopsState.buildNumber;

  const btn = document.getElementById('btn-trigger-build');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Pipeline Đang Chạy...';
  }

  const logBox = document.getElementById('jenkins-console-logs');
  logBox.innerHTML = `[INFO] Started by user Admin (Jenkins CI/CD Server v2.414)\n[INFO] Building in workspace /var/jenkins_home/workspace/ridego-ci-pipeline\n[INFO] Git Checkout branch origin/main (Commit 8f10a9c)\n`;

  resetStageUI();

  // STAGE 1: Checkout & Lint
  setTimeout(() => {
    setStageStatus(1, 'SUCCESS');
    appendLog(logBox, '[STAGE 1] ESLint & SonarQube Code Quality Analysis: PASSED (0 errors, 2 warnings)');

    // STAGE 2: Unit & Integration Tests
    setTimeout(() => {
      setStageStatus(2, 'SUCCESS');
      appendLog(logBox, '[STAGE 2] Running 48 Unit Tests & 12 Integration Tests: ALL PASSED (Coverage 88.4%)');

      // STAGE 3: Docker Build
      setTimeout(() => {
        if (devopsState.simulateFail) {
          // FAIL AT STAGE 3
          setStageStatus(3, 'FAILED');
          appendLog(logBox, '[ERROR] Docker build failed: Error response from daemon: dockerfile line 14 command returned non-zero code 127');
          appendLog(logBox, '[FATAL] Build failed! Sending webhook notification to Slack channel #build-alerts...');
          
          finishBuild(false, buildNum);
        } else {
          setStageStatus(3, 'SUCCESS');
          appendLog(logBox, '[STAGE 3] Docker Image build ridego-backend:v' + buildNum + ' completed successfully.');

          // STAGE 4: Push Registry
          setTimeout(() => {
            setStageStatus(4, 'SUCCESS');
            appendLog(logBox, '[STAGE 4] Pushed Docker image to AWS ECR registry: 901238472.dkr.ecr.ap-southeast-1.amazonaws.com/ridego-backend:v' + buildNum);

            // STAGE 5: K8s Deploy
            setTimeout(() => {
              setStageStatus(5, 'SUCCESS');
              appendLog(logBox, '[STAGE 5] kubectl apply -f k8s/production/ -> AWS EKS Deployment rollout successful!');
              appendLog(logBox, '[SUCCESS] Pipeline completed cleanly in 14.8 seconds.');

              finishBuild(true, buildNum);
            }, 1200);
          }, 1200);
        }
      }, 1200);
    }, 1200);
  }, 1000);
}

function finishBuild(isSuccess, buildNum) {
  devopsState.isBuilding = false;
  const btn = document.getElementById('btn-trigger-build');
  if (btn) {
    btn.disabled = false;
    btn.innerText = '⚡ Trigger Manual Jenkins Build';
  }

  if (isSuccess) {
    showToast(`Jenkins Build #${buildNum} THÀNH CÔNG!`, 'success', 'Jenkins CI/CD');
    renderSlackMessage('SUCCESS', buildNum, 'main', 'Phạm Minh D', `Jenkins Build #${buildNum} Succeeded! Docker image published & K8s rollout verified.`);
  } else {
    showToast(`Jenkins Build #${buildNum} THẤT BẠI! Cảnh báo đã gửi qua Slack.`, 'error', 'Build Failure Alert');
    renderSlackMessage('FAILED', buildNum, 'main', 'Phạm Minh D', `ERR_DOCKER_BUILD_FAILED: Exit Code 127 on Dockerfile line 14 (Missing npm dependency).`);
  }
}

function resetStageUI() {
  for (let i = 1; i <= 5; i++) {
    const badge = document.getElementById(`stage-badge-${i}`);
    if (badge) {
      badge.className = 'badge badge-amber';
      badge.innerText = '⏳ Pending';
    }
  }
}

function setStageStatus(stageNum, status) {
  const badge = document.getElementById(`stage-badge-${stageNum}`);
  if (!badge) return;

  if (status === 'SUCCESS') {
    badge.className = 'badge badge-green';
    badge.innerText = '✅ Passed';
  } else if (status === 'FAILED') {
    badge.className = 'badge badge-red';
    badge.innerText = '🚨 Failed';
  }
}

function appendLog(logBox, text) {
  logBox.innerText += text + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

function renderSlackMessage(status, buildNum, branch, author, detailMessage) {
  const slackContainer = document.getElementById('slack-feed-messages');
  if (!slackContainer) return;

  const isSuccess = status === 'SUCCESS';
  const colorBar = isSuccess ? '#10b981' : '#ef4444';
  const icon = isSuccess ? '✅' : '🚨';
  const statusTitle = isSuccess ? 'BUILD SUCCESSFUL' : 'BUILD FAILURE';

  const msgHtml = `
    <div style="background: rgba(18, 24, 38, 0.85); border-left: 4px solid ${colorBar}; padding: 1rem; border-radius: var(--radius-md); border-top: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #fff; font-size: 0.9rem;">
          <span>🤖</span> <span style="color: var(--text-muted);">Jenkins Bot</span>
          <span class="badge badge-purple" style="font-size: 0.7rem;">APP</span>
        </div>
        <span style="font-size: 0.75rem; color: var(--text-dim);">${new Date().toLocaleTimeString('vi-VN')}</span>
      </div>

      <div style="font-weight: 800; color: ${colorBar}; font-size: 0.95rem; margin-bottom: 0.4rem;">
        ${icon} [Jenkins] ${statusTitle}: Job 'ridego-ci-pipeline' #${buildNum}
      </div>

      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.6rem;">
        Branch: <code style="color:#fff;">${branch}</code> • Triggered by: <strong style="color:#fff;">${author}</strong>
      </div>

      <div style="font-size: 0.85rem; color: #e2e8f0; background: #070a12; padding: 0.6rem 0.8rem; border-radius: 6px; font-family: var(--font-code);">
        ${detailMessage}
      </div>
    </div>
  `;

  slackContainer.innerHTML = msgHtml + slackContainer.innerHTML;
}
